import { randomUUID } from "node:crypto";
import { redactFeedback } from "./redact.mjs";

export const FEEDBACK_QUESTION = "¿Te fue útil esta respuesta? Opcional: ¿qué mejorarías?";

export function createFeedback({ consent, sharedConsent = "denied", rating, text = "", now = new Date().toISOString() }) {
  if (consent !== "granted") return { accepted: false, reason: "consent-required" };
  if (!["useful", "not-useful", "mixed"].includes(rating)) return { accepted: false, reason: "invalid-rating" };
  const redacted = redactFeedback(text);
  if (redacted.rejected) return { accepted: false, reason: "empty-feedback" };
  const createdAt = new Date(now);
  const expiresAt = new Date(createdAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 90);
  return {
    accepted: true,
    record: {
      schemaVersion: "0.5.0",
      candidateId: randomUUID(),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "pending_review",
      consent,
      sharedConsent,
      rating,
      ...redacted,
    },
  };
}
