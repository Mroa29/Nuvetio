import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createFeedback } from "./feedback.mjs";

export async function enqueueFeedback({ directory, consent, rating, text, now }) {
  const result = createFeedback({ consent, rating, text, now });
  if (!result.accepted) return result;
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, "feedback-candidates.jsonl");
  await appendFile(file, JSON.stringify(result.record) + "\n", "utf8");
  return { accepted: true, file };
}

export async function readQueue(file) {
  const source = await readFile(file, "utf8");
  return source.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}
