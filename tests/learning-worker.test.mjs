import test from "node:test";
import assert from "node:assert/strict";
import { createLearningHandler } from "../learning/worker/src/handler.mjs";

function fakeDb() {
  const rows = new Map();
  const reviews = [];
  return {
    rows,
    reviews,
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              if (sql.startsWith("INSERT INTO learning_candidates")) {
                const id = values[0];
                if (rows.has(id)) throw new Error("UNIQUE constraint failed");
                rows.set(id, Object.fromEntries(["id", "schema_version", "created_at", "expires_at", "status", "category", "feedback_signal", "rating", "safe_text", "redactions", "policy_version"].map((key, index) => [key, values[index]])));
              } else if (sql.includes("expires_at <=")) {
                for (const [id, row] of rows) {
                  if (row.status !== "approved" && row.expires_at <= values[0]) rows.delete(id);
                }
              } else if (sql.startsWith("DELETE FROM learning_candidates")) {
                rows.delete(values[0]);
              } else if (sql.startsWith("UPDATE learning_candidates")) {
                const row = rows.get(values[1]);
                if (!row) return { meta: { changes: 0 } };
                row.status = values[0];
                return { meta: { changes: 1 } };
              }
              return { meta: { changes: 1 } };
            },
            async first() { return rows.get(values[0]) ?? null; },
            async all() { return { results: [...rows.values()] }; },
          };
        },
      };
    },
  };
}

const candidate = {
  id: "11111111-1111-4111-8111-111111111111",
  schemaVersion: "0.5.0",
  createdAt: "2026-08-20T00:00:00.000Z",
  expiresAt: "2026-11-18T00:00:00.000Z",
  status: "pending_review",
  rating: "useful",
  safeText: "Faltó un ejemplo.",
  redactions: [],
};

test("Worker accepts only valid candidates and exposes health", async () => {
  const db = fakeDb();
  const handler = createLearningHandler({ db, reviewToken: "review-secret" });
  const health = await handler.fetch(new Request("https://learning.example/v1/health"));
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });
  const accepted = await handler.fetch(new Request("https://learning.example/v1/candidates", { method: "POST", body: JSON.stringify(candidate), headers: { "content-type": "application/json" } }));
  assert.equal(accepted.status, 201);
  const duplicate = await handler.fetch(new Request("https://learning.example/v1/candidates", { method: "POST", body: JSON.stringify(candidate), headers: { "content-type": "application/json" } }));
  assert.equal(duplicate.status, 409);
  const invalid = await handler.fetch(new Request("https://learning.example/v1/candidates", { method: "POST", body: JSON.stringify({ ...candidate, modelUpdate: true }), headers: { "content-type": "application/json" } }));
  assert.equal(invalid.status, 400);
});

test("Worker protects review and supports deletion and expiry", async () => {
  const db = fakeDb();
  const handler = createLearningHandler({ db, reviewToken: "review-secret", now: () => new Date("2026-11-19T00:00:00.000Z") });
  await handler.fetch(new Request("https://learning.example/v1/candidates", { method: "POST", body: JSON.stringify(candidate), headers: { "content-type": "application/json" } }));
  const unauthorized = await handler.fetch(new Request("https://learning.example/v1/review", { method: "POST", body: JSON.stringify({ candidateId: candidate.id, status: "approved" }) }));
  assert.equal(unauthorized.status, 401);
  const approved = await handler.fetch(new Request("https://learning.example/v1/review", { method: "POST", body: JSON.stringify({ candidateId: candidate.id, status: "approved" }), headers: { authorization: "Bearer review-secret" } }));
  assert.equal(approved.status, 200);
  const deleted = await handler.fetch(new Request("https://learning.example/v1/deletion-requests", { method: "POST", body: JSON.stringify({ candidateId: candidate.id }) }));
  assert.equal(deleted.status, 200);
  assert.equal(db.rows.has(candidate.id), false);
});

test("Worker scheduled cleanup removes expired unreviewed candidates", async () => {
  const db = fakeDb();
  const handler = createLearningHandler({ db, reviewToken: "review-secret", now: () => new Date("2026-11-19T00:00:00.000Z") });
  await handler.fetch(new Request("https://learning.example/v1/candidates", { method: "POST", body: JSON.stringify(candidate), headers: { "content-type": "application/json" } }));
  await handler.scheduled();
  assert.equal(db.rows.has(candidate.id), false);
});
