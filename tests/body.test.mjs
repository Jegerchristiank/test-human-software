import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";

const require = createRequire(import.meta.url);
const { readJsonAllowEmpty } = require("../api/_lib/body.js");

function makeReq(payload) {
  const chunks = payload === undefined ? [] : [Buffer.from(payload)];
  const req = Readable.from(chunks);
  req.headers = {};
  return req;
}

describe("readJsonAllowEmpty", () => {
  it("returns an empty object for empty bodies", async () => {
    const result = await readJsonAllowEmpty(makeReq());
    expect(result).toEqual({});
  });

  it("returns an empty object for whitespace bodies", async () => {
    const result = await readJsonAllowEmpty(makeReq("   \n\t"));
    expect(result).toEqual({});
  });

  it("parses valid JSON payloads", async () => {
    const result = await readJsonAllowEmpty(makeReq("{\"ok\":true}"));
    expect(result).toEqual({ ok: true });
  });

  it("rejects invalid JSON", async () => {
    await expect(readJsonAllowEmpty(makeReq("{"))).rejects.toThrow("Invalid JSON");
  });
});
