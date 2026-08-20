const MAX_CANDIDATE_BYTES = 8192;

export function buildSharedCandidate(record) {
  if (record?.sharedConsent !== "granted") return { accepted: false, reason: "shared-consent-required" };
  const { candidateId, schemaVersion, createdAt, expiresAt, status, category, feedback_signal, rating, safeText, redactions, policyVersion } = record;
  return {
    accepted: true,
    candidate: {
      id: candidateId,
      schemaVersion,
      createdAt,
      expiresAt,
      status,
      category,
      feedback_signal,
      rating,
      safeText,
      redactions,
      policyVersion,
    },
  };
}

export async function submitCandidate({ endpoint, candidate, fetchImpl = globalThis.fetch }) {
  if (!candidate?.id || candidate.status !== "pending_review") return { accepted: false, reason: "invalid-candidate" };
  const url = new URL(endpoint);
  if (url.protocol !== "https:" && url.hostname !== "localhost") return { accepted: false, reason: "insecure-endpoint" };
  const body = JSON.stringify(candidate);
  if (Buffer.byteLength(body, "utf8") > MAX_CANDIDATE_BYTES) return { accepted: false, reason: "candidate-too-large" };
  const response = await fetchImpl(url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  if (!response.ok) return { accepted: false, reason: "remote-error", status: response.status };
  return { accepted: true, status: response.status };
}
