import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Agent Skills is bundled as a pinned, optional companion for Codex and Claude", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "addons/agent-skills/manifest.json"), "utf8"));
  const guide = await readFile(path.join(ROOT, "addons/agent-skills/README.md"), "utf8");
  const claudeGuide = await readFile(path.join(ROOT, "addons/agent-skills/installers/claude/README.md"), "utf8");
  assert.equal(manifest.name, "agent-skills");
  assert.equal(manifest.version, "0.6.7");
  assert.equal(manifest.author, "Addy Osmani");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.optional, true);
  assert.match(manifest.commit, /^[0-9a-f]{40}$/);
  assert.match(guide, /consentimiento|confirmación/i);
  assert.match(guide, /Codex|Claude Code/);
  assert.match(claudeGuide, /addyosmani\/agent-skills/);
  assert.match(claudeGuide, /addy-agent-skills/);
  assert.match(guide, /no.*modifica|no.*sobrescribe/i);
});
