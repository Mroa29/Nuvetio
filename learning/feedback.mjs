import { redactFeedback } from "./redact.mjs";

export const FEEDBACK_QUESTION = "¿Te fue útil esta respuesta? Opcional: ¿qué mejorarías?";

export function createFeedback({ consent, rating, text = "", now = new Date().toISOString() }) {
  if (consent !== "granted") return { accepted: false, reason: "consent-required" };
  if (!["useful", "not-useful", "mixed"].includes(rating)) return { accepted: false, reason: "invalid-rating" };
  const redacted = redactFeedback(text);
  if (redacted.rejected) return { accepted: false, reason: "empty-feedback" };
  return { accepted: true, record: { schemaVersion: "0.4.0", createdAt: now, consent, rating, ...redacted } };
}
