import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Claude adapter is portable, opt-in, and preserves existing instructions", async () => {
  const adapter = await readFile(path.join(ROOT, "adapters/claude/skills/nuvetio/SKILL.md"), "utf8");
  const instructions = await readFile(path.join(ROOT, "adapters/claude/CLAUDE.md"), "utf8");
  const mac = await readFile(path.join(ROOT, "installers/macos/Instalar-Nuvetio.command"), "utf8");
  const windows = await readFile(path.join(ROOT, "installers/windows/Instalar-Nuvetio.ps1"), "utf8");

  assert.match(adapter, /^---[\s\S]*name: nuvetio/m);
  assert.match(adapter, /Claude Code/i);
  assert.match(instructions, /No sobrescribas un `CLAUDE\.md` existente/);
  assert.match(mac, /\.claude/);
  assert.match(mac, /skills\/nuvetio/);
  assert.match(mac, /\[ ! -f \"\$CLAUDE_HOME\/CLAUDE\.md\" \]/);
  assert.match(windows, /\.claude/);
  assert.match(windows, /skills.*nuvetio/);
  assert.match(windows, /if \(-not \(Test-Path -LiteralPath \$claudeInstructions/);
});
