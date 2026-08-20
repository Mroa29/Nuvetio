import test from "node:test";
import assert from "node:assert/strict";
import { createFeedback } from "../learning/feedback.mjs";
import { buildSharedCandidate, submitCandidate } from "../learning/shared-client.mjs";

test("shared candidates require shared consent and expire after 90 days", () => {
  const denied = createFeedback({ consent: "granted", sharedConsent: "denied", rating: "useful", text: "ok", now: "2026-08-20T00:00:00.000Z" });
  assert.equal(buildSharedCandidate(denied.record).reason, "shared-consent-required");

  const result = createFeedback({ consent: "granted", sharedConsent: "granted", rating: "mixed", text: "Faltó un ejemplo.", now: "2026-08-20T00:00:00.000Z" });
  assert.equal(result.record.schemaVersion, "0.5.0");
  assert.equal(result.record.status, "pending_review");
  assert.equal(result.record.expiresAt, "2026-11-18T00:00:00.000Z");
  assert.match(result.record.candidateId, /^[0-9a-f-]{36}$/i);
  const candidate = buildSharedCandidate(result.record);
  assert.equal(candidate.accepted, true);
  assert.equal(candidate.candidate.safeText, "Faltó un ejemplo.");
  assert.equal(candidate.candidate.modelUpdate, undefined);
});

test("shared client sends only the structured candidate", async () => {
  let call;
  const response = await submitCandidate({
    endpoint: "https://learning.example.test/v1/candidates",
    candidate: { id: "candidate-1", schemaVersion: "0.5.0", status: "pending_review", safeText: "ok" },
    fetchImpl: async (...args) => { call = args; return new Response("{}", { status: 201 }); },
  });
  assert.deepEqual(response, { accepted: true, status: 201 });
  assert.equal(call[0], "https://learning.example.test/v1/candidates");
  assert.equal(call[1].method, "POST");
  assert.deepEqual(JSON.parse(call[1].body), { id: "candidate-1", schemaVersion: "0.5.0", status: "pending_review", safeText: "ok" });
});
