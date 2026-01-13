const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { isAdminUser, isImportEnabled } = require("../_lib/admin");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { DATA_PATHS, getDatasetSnapshot, readJsonFile } = require("../_lib/datasets");

const ROOT_PATH = path.resolve(__dirname, "..", "..");
const RAW_PATHS = {
  mcq: path.join(ROOT_PATH, "rawdata-mc"),
  kortsvar: path.join(ROOT_PATH, "rawdata-kortsvar"),
  sygdomslaere: path.join(ROOT_PATH, "rawdata-sygdomslaere.txt"),
};
const IMPORT_PATHS = {
  mcq: path.join(ROOT_PATH, "imports", "rawdata-mc.txt"),
  kortsvar: path.join(ROOT_PATH, "imports", "rawdata-kortsvar.txt"),
  sygdomslaere: path.join(ROOT_PATH, "imports", "rawdata-sygdomslaere.txt"),
};

async function safeCount(queryPromise) {
  try {
    const { count, error } = await queryPromise;
    if (error) return null;
    return typeof count === "number" ? count : 0;
  } catch (error) {
    return null;
  }
}

async function getFileInfo(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      bytes: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch (error) {
    return null;
  }
}

function sumBalance(entries) {
  const totals = {};
  if (!Array.isArray(entries)) return totals;
  entries.forEach((entry) => {
    if (!entry || typeof entry.amount !== "number") return;
    const currency = entry.currency || "unknown";
    totals[currency] = (totals[currency] || 0) + entry.amount;
  });
  return totals;
}

function normalizeVercelMetrics(payload) {
  if (!payload || typeof payload !== "object") return null;
  const source = payload.total || payload.totals || payload.summary || payload.data || payload;
  if (!source || typeof source !== "object") return null;
  const metrics = {};
  const keys = [
    "visitors",
    "pageviews",
    "views",
    "visits",
    "requests",
    "bandwidth",
    "avgDuration",
    "avg_duration",
    "bounceRate",
    "bounce_rate",
  ];
  keys.forEach((key) => {
    if (typeof source[key] === "number") {
      metrics[key] = source[key];
    }
  });
  return Object.keys(metrics).length ? metrics : null;
}

async function fetchVercelAnalytics() {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return { configured: false, analytics: null, project: null };
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const now = Date.now();
  const fromMs = now - 7 * 24 * 60 * 60 * 1000;
  const fromIso = new Date(fromMs).toISOString();
  const toIso = new Date(now).toISOString();

  const baseParams = new URLSearchParams({ projectId, from: fromIso, to: toIso });
  if (teamId) baseParams.set("teamId", teamId);

  const altParams = new URLSearchParams({
    projectId,
    from: String(fromMs),
    to: String(now),
  });
  if (teamId) altParams.set("teamId", teamId);

  const projectParams = new URLSearchParams({ from: fromIso, to: toIso });
  if (teamId) projectParams.set("teamId", teamId);

  const candidates = [
    `https://api.vercel.com/v1/analytics?${baseParams.toString()}`,
    `https://api.vercel.com/v1/analytics?${altParams.toString()}`,
    `https://api.vercel.com/v9/projects/${projectId}/analytics?${projectParams.toString()}`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const payload = await res.json();
      const metrics = normalizeVercelMetrics(payload);
      if (metrics) {
        return {
          configured: true,
          analytics: {
            metrics,
            period: { from: fromIso, to: toIso },
          },
        };
      }
    } catch (error) {
      // Fall through to next attempt.
    }
  }

  try {
    const projectParams = new URLSearchParams();
    if (teamId) projectParams.set("teamId", teamId);
    const projectRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}?${projectParams.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (projectRes.ok) {
      const project = await projectRes.json();
      return {
        configured: true,
        analytics: null,
        project: {
          name: project?.name || null,
          framework: project?.framework || null,
        },
      };
    }
  } catch (error) {
    // Ignore project fetch errors.
  }

  return { configured: true, analytics: null, project: null };
}

async function resolveDatasetStats(type, countFn) {
  let snapshot = null;
  try {
    snapshot = await getDatasetSnapshot(type);
  } catch (error) {
    snapshot = null;
  }

  if (snapshot) {
    const payloadCount =
      typeof snapshot.item_count === "number" ? snapshot.item_count : countFn(snapshot.payload);
    const rawBytes =
      snapshot.raw_text && typeof snapshot.raw_text === "string"
        ? Buffer.byteLength(snapshot.raw_text, "utf-8")
        : null;
    return {
      count: payloadCount,
      dataUpdatedAt: snapshot.updated_at || null,
      rawInfo: snapshot.updated_at
        ? { updatedAt: snapshot.updated_at, bytes: rawBytes }
        : null,
      importInfo: snapshot.updated_at
        ? { updatedAt: snapshot.updated_at, bytes: rawBytes }
        : null,
      source: "supabase",
    };
  }

  const dataPayload = await readJsonFile(DATA_PATHS[type]);
  const dataInfo = await getFileInfo(DATA_PATHS[type]);
  return {
    count: countFn(dataPayload),
    dataUpdatedAt: dataInfo?.updatedAt || null,
    rawInfo: await getFileInfo(RAW_PATHS[type]),
    importInfo: await getFileInfo(IMPORT_PATHS[type]),
    source: "file",
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:metrics",
      limit: 12,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    return sendError(res, 500, "supabase_not_configured");
  }
  const now = Date.now();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const counts = await Promise.all([
    safeCount(supabase.from("profiles").select("id", { count: "exact", head: true })),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7d)
    ),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30d)
    ),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "free")
    ),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "paid")
    ),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "trial")
    ),
    safeCount(
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "lifetime")
    ),
    safeCount(
      supabase.from("subscriptions").select("id", { count: "exact", head: true })
    ),
    safeCount(
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .in("status", ["trialing", "active"])
    ),
    safeCount(
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "past_due")
    ),
    safeCount(
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "canceled")
    ),
    safeCount(
      supabase.from("user_state").select("user_id", { count: "exact", head: true })
    ),
    safeCount(
      supabase
        .from("user_state")
        .select("user_id", { count: "exact", head: true })
        .gte("updated_at", since7d)
    ),
    safeCount(
      supabase.from("usage_events").select("id", { count: "exact", head: true })
    ),
    safeCount(
      supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d)
    ),
    safeCount(
      supabase.from("evaluation_logs").select("id", { count: "exact", head: true })
    ),
    safeCount(
      supabase
        .from("evaluation_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d)
    ),
    safeCount(
      supabase.from("audit_events").select("id", { count: "exact", head: true })
    ),
    safeCount(
      supabase
        .from("audit_events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d)
    ),
  ]);

  const [
    profilesTotal,
    profiles7d,
    profiles30d,
    planFree,
    planPaid,
    planTrial,
    planLifetime,
    subsTotal,
    subsActive,
    subsPastDue,
    subsCanceled,
    userStateTotal,
    userStateActive7d,
    usageTotal,
    usage7d,
    evalTotal,
    eval7d,
    auditTotal,
    audit7d,
  ] = counts;

  const [mcqStats, shortStats, diseaseStats, vercel] = await Promise.all([
    resolveDatasetStats("mcq", (payload) => (Array.isArray(payload) ? payload.length : null)),
    resolveDatasetStats("kortsvar", (payload) => (Array.isArray(payload) ? payload.length : null)),
    resolveDatasetStats(
      "sygdomslaere",
      (payload) => (Array.isArray(payload?.diseases) ? payload.diseases.length : null)
    ),
    fetchVercelAnalytics(),
  ]);

  const dataCounts = {
    mcq: mcqStats.count,
    kortsvar: shortStats.count,
    sygdomslaere: diseaseStats.count,
  };

  const rawdata = {
    mcq: mcqStats.rawInfo,
    kortsvar: shortStats.rawInfo,
    sygdomslaere: diseaseStats.rawInfo,
  };

  const imports = {
    mcq: mcqStats.importInfo,
    kortsvar: shortStats.importInfo,
    sygdomslaere: diseaseStats.importInfo,
  };

  let stripe = { configured: false, balance: null };
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) {
    try {
      const stripeClient = new Stripe(secretKey, { apiVersion: "2024-06-20" });
      const balance = await stripeClient.balance.retrieve();
      stripe = {
        configured: true,
        balance: {
          available: sumBalance(balance.available),
          pending: sumBalance(balance.pending),
        },
      };
    } catch (error) {
      stripe = { configured: true, balance: null };
    }
  }

  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const issues = [];
  if (!openAiConfigured) {
    issues.push("OpenAI");
  }
  if (!secretKey) {
    issues.push("Stripe");
  }
  const health = {
    status: issues.length ? (issues.length === 1 ? "partial" : "missing") : "ok",
    issues,
    ai: {
      configured: openAiConfigured,
      model: process.env.OPENAI_MODEL || "gpt-5.2",
    },
    tts: {
      configured: openAiConfigured,
      model: process.env.OPENAI_TTS_MODEL || "tts-1",
    },
    supabase: { configured: true },
    stripe: { configured: Boolean(secretKey) },
  };

  return sendJson(res, 200, {
    admin: {
      importEnabled: isImportEnabled(),
    },
    supabase: {
      profiles: {
        total: profilesTotal,
        new7d: profiles7d,
        new30d: profiles30d,
        plans: {
          free: planFree,
          paid: planPaid,
          trial: planTrial,
          lifetime: planLifetime,
        },
      },
      subscriptions: {
        total: subsTotal,
        active: subsActive,
        past_due: subsPastDue,
        canceled: subsCanceled,
      },
      user_state: {
        total: userStateTotal,
        active7d: userStateActive7d,
      },
      usage_events: {
        total: usageTotal,
        last7d: usage7d,
      },
      evaluation_logs: {
        total: evalTotal,
        last7d: eval7d,
      },
      audit_events: {
        total: auditTotal,
        last7d: audit7d,
      },
    },
    stripe,
    vercel,
    health,
    data: dataCounts,
    rawdata,
    imports,
  });
};
