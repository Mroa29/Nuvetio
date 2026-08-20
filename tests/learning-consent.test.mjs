import test from "node:test";
import assert from "node:assert/strict";
import { getConsent, getSharedConsent, setConsent, setSharedConsent } from "../learning/consent.mjs";

test("local and shared learning consent are independent and revocable", () => {
  const values = new Map();
  const store = { get: (key) => values.get(key), set: (key, value) => values.set(key, value) };
  assert.equal(getConsent(store), "unknown");
  assert.equal(getSharedConsent(store), "unknown");

  setConsent(store, "granted", "2026-08-20T00:00:00.000Z");
  assert.equal(getConsent(store), "granted");
  assert.equal(getSharedConsent(store), "unknown");

  setSharedConsent(store, "granted", "2026-08-20T00:01:00.000Z");
  assert.equal(getSharedConsent(store), "granted");
  setSharedConsent(store, "denied", "2026-08-20T00:02:00.000Z");
  assert.equal(getSharedConsent(store), "denied");
  assert.equal(values.get("nuvetio.learning.sharedConsentAt"), "2026-08-20T00:02:00.000Z");
});
