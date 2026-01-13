const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { isAdminUser, isImportEnabled } = require("../_lib/admin");
const { getSupabaseAdmin } = require("../_lib/supabase");

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
const DATA_PATHS = {
  mcq: path.join(ROOT_PATH, "data", "questions.json"),
  kortsvar: path.join(ROOT_PATH, "data", "kortsvar.json"),
  sygdomslaere: path.join(ROOT_PATH, "data", "sygdomslaere.json"),
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

async function readJsonFile(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
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

  if (!isAdminUser(user)) {
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

  const [mcqData, shortData, diseaseData] = await Promise.all([
    readJsonFile(DATA_PATHS.mcq),
    readJsonFile(DATA_PATHS.kortsvar),
    readJsonFile(DATA_PATHS.sygdomslaere),
  ]);

  const dataCounts = {
    mcq: Array.isArray(mcqData) ? mcqData.length : null,
    kortsvar: Array.isArray(shortData) ? shortData.length : null,
    sygdomslaere: Array.isArray(diseaseData?.diseases) ? diseaseData.diseases.length : null,
  };

  const [rawMcq, rawShort, rawDisease, importMcq, importShort, importDisease] = await Promise.all([
    getFileInfo(RAW_PATHS.mcq),
    getFileInfo(RAW_PATHS.kortsvar),
    getFileInfo(RAW_PATHS.sygdomslaere),
    getFileInfo(IMPORT_PATHS.mcq),
    getFileInfo(IMPORT_PATHS.kortsvar),
    getFileInfo(IMPORT_PATHS.sygdomslaere),
  ]);

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
    data: dataCounts,
    rawdata: {
      mcq: rawMcq,
      kortsvar: rawShort,
      sygdomslaere: rawDisease,
    },
    imports: {
      mcq: importMcq,
      kortsvar: importShort,
      sygdomslaere: importDisease,
    },
  });
};
