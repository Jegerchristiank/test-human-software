const crypto = require("crypto");
const { requireEnv } = require("./env");
const { getSupabaseAdmin } = require("./supabase");

const TABLE = "user_openai_keys";
const VERSION = "v1";
const IV_BYTES = 12;

function getEncryptionKey() {
  const secret = requireEnv("OPENAI_KEY_ENCRYPTION_SECRET");
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptValue(value) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

function decryptValue(payload) {
  if (!payload || typeof payload !== "string") return null;
  const parts = payload.split(":");
  if (parts.length !== 4) return null;
  const [version, ivB64, tagB64, dataB64] = parts;
  if (version !== VERSION) return null;
  try {
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    if (iv.length !== IV_BYTES || tag.length !== 16) return null;
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch (error) {
    return null;
  }
}

async function upsertUserOpenAiKey(userId, openAiKey) {
  if (!userId || !openAiKey) return false;
  const supabase = getSupabaseAdmin();
  const encrypted = encryptValue(openAiKey);
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, key_ciphertext: encrypted }, { onConflict: "user_id" });
  if (error) throw error;
  return true;
}

async function deleteUserOpenAiKey(userId) {
  if (!userId) return false;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

async function fetchUserOpenAiKey(userId) {
  if (!userId) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("key_ciphertext")
    .eq("user_id", userId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  if (!data?.key_ciphertext) return null;
  return decryptValue(data.key_ciphertext);
}

async function hasUserOpenAiKey(userId) {
  if (!userId) return false;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return Boolean(data?.user_id);
}

module.exports = {
  upsertUserOpenAiKey,
  deleteUserOpenAiKey,
  fetchUserOpenAiKey,
  hasUserOpenAiKey,
};
