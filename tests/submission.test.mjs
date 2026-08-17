import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("submission includes required positive and negative cases", async () => {
  const cases = JSON.parse(
    await readFile(path.join(ROOT, "submission/test-cases.json"), "utf8"),
  );
  assert.equal(cases.filter(({ kind }) => kind === "positive").length, 5);
  assert.equal(cases.filter(({ kind }) => kind === "negative").length, 3);
  for (const item of cases) {
    assert.match(item.id, /^(positive|negative)-[1-9]$/);
    assert.ok(item.prompt.length > 20);
    assert.ok(item.expectedBehavior.length > 40);
    assert.ok(item.expectedResultShape.length > 20);
  }
});

test("starter prompts match the public product scope", async () => {
  const prompts = JSON.parse(
    await readFile(path.join(ROOT, "submission/starter-prompts.es.json"), "utf8"),
  );
  assert.equal(prompts.length, 3);
  assert.ok(prompts.some((prompt) => /producto con IA/i.test(prompt)));
  assert.ok(prompts.some((prompt) => /mockup/i.test(prompt)));
});
