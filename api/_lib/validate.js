function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function errorResult(message, status = 400) {
  return { ok: false, error: message, status };
}

function resolveStatus(rule, type) {
  if (type === "maxLen" || type === "maxItems") {
    return rule.maxLenStatus || rule.maxItemsStatus || 413;
  }
  if (type === "pattern") {
    return rule.patternStatus || 400;
  }
  if (type === "range") {
    return rule.rangeStatus || 400;
  }
  if (type === "type") {
    return rule.typeStatus || 400;
  }
  return rule.status || 400;
}

function validateString(value, rule, path) {
  if (typeof value !== "string") {
    return errorResult(rule.typeMessage || `Invalid ${path}`, resolveStatus(rule, "type"));
  }
  if (rule.minLen !== undefined && value.length < rule.minLen) {
    return errorResult(rule.minLenMessage || `Invalid ${path}`, rule.minLenStatus || 400);
  }
  if (rule.maxLen !== undefined && value.length > rule.maxLen) {
    return errorResult(rule.maxLenMessage || `Invalid ${path}`, resolveStatus(rule, "maxLen"));
  }
  if (rule.pattern && !rule.pattern.test(value)) {
    return errorResult(rule.patternMessage || `Invalid ${path}`, resolveStatus(rule, "pattern"));
  }
  return { ok: true };
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function validateNumber(value, rule, path) {
  const numeric = rule.coerce ? toNumber(value) : value;
  if (!Number.isFinite(numeric)) {
    return errorResult(rule.typeMessage || `Invalid ${path}`, resolveStatus(rule, "type"));
  }
  if (rule.min !== undefined && numeric < rule.min) {
    return errorResult(rule.rangeMessage || `Invalid ${path}`, resolveStatus(rule, "range"));
  }
  if (rule.max !== undefined && numeric > rule.max) {
    return errorResult(rule.rangeMessage || `Invalid ${path}`, resolveStatus(rule, "range"));
  }
  return { ok: true };
}

function validateBoolean(value, rule, path) {
  if (typeof value !== "boolean") {
    return errorResult(rule.typeMessage || `Invalid ${path}`, resolveStatus(rule, "type"));
  }
  return { ok: true };
}

function validateArray(value, rule, path) {
  if (!Array.isArray(value)) {
    return errorResult(rule.typeMessage || `Invalid ${path}`, resolveStatus(rule, "type"));
  }
  if (rule.minItems !== undefined && value.length < rule.minItems) {
    return errorResult(rule.minItemsMessage || `Invalid ${path}`, rule.minItemsStatus || 400);
  }
  if (rule.maxItems !== undefined && value.length > rule.maxItems) {
    return errorResult(rule.maxItemsMessage || `Invalid ${path}`, resolveStatus(rule, "maxItems"));
  }
  if (rule.item) {
    for (let i = 0; i < value.length; i += 1) {
      const result = validateValue(value[i], rule.item, `${path}[${i}]`);
      if (!result.ok) return result;
    }
  }
  return { ok: true };
}

function validateObject(value, rule, path) {
  if (!isPlainObject(value)) {
    return errorResult(rule.typeMessage || `Invalid ${path}`, resolveStatus(rule, "type"));
  }
  const fields = rule.fields || {};
  if (!rule.allowUnknown) {
    for (const key of Object.keys(value)) {
      if (!fields[key]) {
        return errorResult(`Unknown field: ${key}`, 400);
      }
    }
  }
  for (const [key, fieldRule] of Object.entries(fields)) {
    const result = validateValue(value[key], fieldRule, key);
    if (!result.ok) return result;
  }
  return { ok: true };
}

function validateValue(value, rule, path) {
  if (value === undefined) {
    if (rule.required) {
      return errorResult(rule.requiredMessage || `Missing ${path}`, rule.requiredStatus || 400);
    }
    return { ok: true };
  }
  if (value === null) {
    if (rule.nullable) return { ok: true };
    return errorResult(rule.nullMessage || `Invalid ${path}`, rule.nullStatus || 400);
  }
  if (rule.enum && !rule.enum.includes(value)) {
    return errorResult(rule.enumMessage || `Invalid ${path}`, rule.enumStatus || 400);
  }
  switch (rule.type) {
    case "string":
      return validateString(value, rule, path);
    case "number":
      return validateNumber(value, rule, path);
    case "boolean":
      return validateBoolean(value, rule, path);
    case "array":
      return validateArray(value, rule, path);
    case "object":
      return validateObject(value, rule, path);
    default:
      return { ok: true };
  }
}

function validatePayload(payload, schema) {
  if (!isPlainObject(payload)) {
    return errorResult("Invalid payload", 400);
  }
  const rule = {
    type: "object",
    allowUnknown: false,
    fields: {},
    ...schema,
  };
  return validateObject(payload, rule, "payload");
}

module.exports = {
  validatePayload,
};
