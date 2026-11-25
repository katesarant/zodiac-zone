import { test } from "node:test";
import assert from "node:assert/strict";
import { createChallenge, verifyChallenge } from "./captcha.server";

test("contact challenge proof rejects wrong answers, tampering, and legacy answer tokens", async () => {
  const originalNow = Date.now;
  try {
    const issued = originalNow();
    Date.now = () => issued;
    const challenge = await createChallenge("en");
    const numbers = challenge.question.match(/\d+/g);
    const left = Number(numbers?.[0]);
    const right = Number(numbers?.[1]);
    assert.ok(Number.isFinite(left) && Number.isFinite(right));
    const answer = challenge.question.includes("+") ? left + right : left - right;
    assert.match(challenge.token, /^v2\.[A-Za-z0-9_-]{32}\.\d{13}\.[A-Za-z0-9_-]{43}$/);
    assert.equal(await verifyChallenge(challenge.token, String(answer)), false);
    Date.now = () => issued + 3000;
    assert.equal(await verifyChallenge(challenge.token, String(answer)), true);
    assert.equal(await verifyChallenge(challenge.token, String(answer + 1)), false);
    assert.equal(await verifyChallenge(`${challenge.token}.extra`, String(answer)), false);
    assert.equal(await verifyChallenge(challenge.token.replace("v2.", "v1."), String(answer)), false);
    const legacy = `${btoa(`${answer}.${issued}`)}.pretend-signature`;
    assert.equal(await verifyChallenge(legacy, String(answer)), false);
    Date.now = () => issued + 600001;
    assert.equal(await verifyChallenge(challenge.token, String(answer)), false);
  } finally {
    Date.now = originalNow;
  }
});

test("contact challenge fails closed when no signing secret is configured", async () => {
  const original = process.env["CONTACT_CAPTCHA_SECRET"];
  try {
    delete process.env["CONTACT_CAPTCHA_SECRET"];
    await assert.rejects(createChallenge("en"), /captcha_unavailable/);
  } finally {
    if (original !== undefined) process.env["CONTACT_CAPTCHA_SECRET"] = original;
  }
});