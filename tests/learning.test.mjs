import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getConsent, setConsent } from "../learning/consent.mjs";
import { createFeedback, FEEDBACK_QUESTION } from "../learning/feedback.mjs";
import { enqueueFeedback, readQueue } from "../learning/queue.mjs";
import { redactFeedback } from "../learning/redact.mjs";

test("learning is consent-first, redacted, local, and never an automatic model update", async () => {
  assert.match(FEEDBACK_QUESTION, /Te fue útil/i);
  const values = new Map();
  const store = { get: (key) => values.get(key), set: (key, value) => values.set(key, value) };
  assert.equal(getConsent(store), "unknown");
  assert.equal(setConsent(store, "denied").value, "denied");
  assert.equal(createFeedback({ consent: "denied", rating: "useful", text: "ok" }).reason, "consent-required");

  setConsent(store, "granted", "2026-08-20T00:00:00.000Z");
  const redacted = redactFeedback("Escríbeme en marcos@example.com, token sk-live_abc123, ruta C:\\Users\\Marcos\\proyecto");
  assert.doesNotMatch(redacted.safeText, /marcos@example\.com|sk-live|C:\\Users\\Marcos/i);
  assert.ok(redacted.redactions.includes("email"));
  assert.ok(redacted.redactions.includes("token"));
  assert.ok(redacted.redactions.includes("path"));

  const candidate = createFeedback({ consent: "granted", rating: "useful", text: "La respuesta fue clara.", now: "2026-08-20T00:00:00.000Z" });
  assert.equal(candidate.accepted, true);
  assert.equal(candidate.record.schemaVersion, "0.5.0");
  assert.equal(candidate.record.safeText, "La respuesta fue clara.");

  const directory = await mkdtemp(path.join(os.tmpdir(), "nuvetio-learning-"));
  try {
    const queued = await enqueueFeedback({ directory, consent: "granted", sharedConsent: "denied", rating: "mixed", text: "Útil, pero faltó un ejemplo." });
    assert.equal(queued.accepted, true);
    const records = await readQueue(queued.file);
    assert.equal(records.length, 1);
    assert.equal(records[0].consent, "granted");
    assert.equal(records[0].modelUpdate, undefined);
    assert.doesNotMatch(await readFile(queued.file, "utf8"), /@|sk-live|C:\\\\Users/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
