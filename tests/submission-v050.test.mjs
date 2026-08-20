import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("v0.5 ChatGPT handoff describes the optional Worker and consultive departments", async () => {
  const notes = await readFile(path.join(ROOT, "submission/v050-submission-notes.md"), "utf8");
  const handoff = await readFile(path.join(ROOT, "submission/openai-portal-handoff.md"), "utf8");
  assert.match(notes, /skills-only/i);
  assert.match(notes, /Cloudflare Worker|Worker.*D1/i);
  assert.match(notes, /Marketing.*Operaciones.*Finanzas.*Legal/s);
  assert.match(notes, /Agent Skills/i);
  assert.match(notes, /NOT SUBMITTED/);
  assert.match(handoff, /NOT SUBMITTED/);
});
