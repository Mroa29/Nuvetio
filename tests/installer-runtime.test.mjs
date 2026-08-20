import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("installers do not make Codex CLI a hard prerequisite", async () => {
  const mac = await readFile(path.join(ROOT, "installers/macos/Instalar-Nuvetio.command"), "utf8");
  const ps = await readFile(path.join(ROOT, "installers/windows/Instalar-Nuvetio.ps1"), "utf8");
  const cmd = await readFile(path.join(ROOT, "installers/windows/Instalar-Nuvetio.cmd"), "utf8");
  const postinstall = await readFile(path.join(ROOT, "packaging/macos/postinstall"), "utf8");

  for (const source of [mac, ps, cmd, postinstall]) {
    assert.match(source, /Claude|claude/i, "the recovery path must mention Claude Code");
    assert.match(source, /Codex CLI|codex/i, "the recovery path must mention Codex CLI");
    assert.doesNotMatch(source, /no encontramos Codex CLI[\s\S]*(exit 1|exit \s*\/b\s*1)/i);
  }
  assert.match(mac, /NUVETIO_INSTALL_CODEX_CLI/);
  assert.match(ps, /NUVETIO_INSTALL_CODEX_CLI/);
  assert.doesNotMatch(mac, /curl\s+[^\n|]*\|\s*(sh|bash)/i);
  assert.doesNotMatch(ps, /irm\s+[^\n|]*\|\s*iex/i);
});
