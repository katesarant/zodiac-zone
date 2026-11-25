import { test } from "node:test";
import assert from "node:assert/strict";

test("visitors cannot read the dashboard password configuration", async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  assert.ok(url && key, "Database verification configuration is required");
  const headers = new Headers({ apikey: key });
  if (!key.startsWith("sb_")) headers.set("Authorization", `Bearer ${key}`);
  const response = await fetch(`${url}/rest/v1/analytics_config?select=id&limit=1`, { headers });
  assert.ok([401, 403].includes(response.status), "Dashboard configuration must deny anonymous reads");
});