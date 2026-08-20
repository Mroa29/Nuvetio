const MAX_BODY_BYTES = 8192;
const ALLOWED_FIELDS = new Set([
  "id", "schemaVersion", "createdAt", "expiresAt", "status", "category",
  "feedback_signal", "rating", "safeText", "redactions", "policyVersion",
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function readJson(request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return { error: "payload-too-large" };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return { error: "payload-too-large" };
  try {
    return { value: JSON.parse(text) };
  } catch {
    return { error: "invalid-json" };
  }
}

function validateCandidate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "invalid-candidate";
  if (Object.keys(value).some((key) => !ALLOWED_FIELDS.has(key))) return "unknown-field";
  if (typeof value.id !== "string" || value.id.length > 80) return "invalid-id";
  if (value.schemaVersion !== "0.5.0") return "invalid-schema";
  if (value.status !== "pending_review") return "invalid-status";
  if (!["useful", "not-useful", "mixed"].includes(value.rating)) return "invalid-rating";
  if (typeof value.safeText !== "string" || value.safeText.length > 2000 || !value.safeText.trim()) return "invalid-text";
  if (!Array.isArray(value.redactions)) return "invalid-redactions";
  if (Number.isNaN(Date.parse(value.createdAt)) || Number.isNaN(Date.parse(value.expiresAt))) return "invalid-dates";
  return null;
}

export function createLearningHandler({ db, reviewToken = "", now = () => new Date() }) {
  if (!db?.prepare) throw new TypeError("D1 database binding is required");

  async function fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/v1/health") return json({ ok: true });
    if (request.method !== "POST") return json({ error: "method-not-allowed" }, 405);

    const parsed = await readJson(request);
    if (parsed.error) return json({ error: parsed.error }, 400);

    if (url.pathname === "/v1/candidates") {
      const reason = validateCandidate(parsed.value);
      if (reason) return json({ error: reason }, 400);
      const value = parsed.value;
      try {
        await db.prepare("INSERT INTO learning_candidates (id, schema_version, created_at, expires_at, status, category, feedback_signal, rating, safe_text, redactions, policy_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(value.id, value.schemaVersion, value.createdAt, value.expiresAt, value.status, value.category ?? null, value.feedback_signal ?? null, value.rating, value.safeText, JSON.stringify(value.redactions), value.policyVersion ?? null)
          .run();
      } catch (error) {
        if (/unique/i.test(String(error?.message))) return json({ error: "duplicate-candidate" }, 409);
        return json({ error: "storage-failed" }, 500);
      }
      return json({ accepted: true, id: value.id }, 201);
    }

    if (url.pathname === "/v1/deletion-requests") {
      if (typeof parsed.value?.candidateId !== "string") return json({ error: "invalid-candidate-id" }, 400);
      await db.prepare("DELETE FROM learning_candidates WHERE id = ?").bind(parsed.value.candidateId).run();
      return json({ accepted: true });
    }

    if (url.pathname === "/v1/review") {
      const authorization = request.headers.get("authorization") ?? "";
      if (!reviewToken || authorization !== `Bearer ${reviewToken}`) return json({ error: "unauthorized" }, 401);
      if (!parsed.value || !["approved", "rejected"].includes(parsed.value.status) || typeof parsed.value.candidateId !== "string") return json({ error: "invalid-review" }, 400);
      const update = await db.prepare("UPDATE learning_candidates SET status = ? WHERE id = ? AND status = 'pending_review'").bind(parsed.value.status, parsed.value.candidateId).run();
      if (!update?.meta?.changes) return json({ error: "candidate-not-found" }, 404);
      await db.prepare("INSERT INTO review_events (candidate_id, action, reviewer_ref, notes, created_at) VALUES (?, ?, ?, ?, ?)").bind(parsed.value.candidateId, parsed.value.status, "admin", String(parsed.value.notes ?? "").slice(0, 1000), now().toISOString()).run();
      return json({ accepted: true });
    }

    return json({ error: "not-found" }, 404);
  }

  async function scheduled() {
    await db.prepare("DELETE FROM learning_candidates WHERE status != 'approved' AND expires_at <= ?").bind(now().toISOString()).run();
  }

  return { fetch, scheduled };
}
