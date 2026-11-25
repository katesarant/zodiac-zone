import { test } from "node:test";
import assert from "node:assert/strict";

function config(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing test configuration: ${name}`);
  return value;
}

async function readInterpretations(key: string): Promise<Response> {
  const headers = new Headers({ apikey: key });
  if (!key.startsWith("sb_")) headers.set("Authorization", `Bearer ${key}`);
  return fetch(`${config("SUPABASE_URL")}/rest/v1/interpretations?select=chart_hash&limit=1`, { headers });
}

test("visitors cannot directly read saved interpretations", async () => {
  const response = await readInterpretations(config("SUPABASE_PUBLISHABLE_KEY"));
  assert.ok([401, 403].includes(response.status));
});

test("the server can still read the interpretation cache", async () => {
  const response = await readInterpretations(config("SUPABASE_SERVICE_ROLE_KEY"));
  assert.equal(response.status, 200);
  const rows: unknown = await response.json();
  assert.ok(Array.isArray(rows));
});