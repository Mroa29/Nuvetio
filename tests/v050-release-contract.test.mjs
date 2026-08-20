import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relative) {
  return readFile(path.join(root, relative), "utf8");
}

test("v0.5 release contract is consistent across distribution and CI", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const manifest = JSON.parse(await read("plugins/nuvetio/.codex-plugin/plugin.json"));
  const installer = JSON.parse(await read("packaging/native-installer.json"));
  const copy = await read("content/public-copy.es.json");
  const home = await read("docs/index.html");
  const notes = await read("submission/release-notes.md");
  const workflow = await read(".github/workflows/build-installers.yml");

  assert.equal(packageJson.version, "0.5.0");
  assert.equal(manifest.version, "0.5.0");
  assert.equal(installer.version, "0.5.0");
  assert.match(installer.artifacts[0], /Nuvetio-0\.5\.0-Setup\.exe/);
  assert.match(installer.artifacts[1], /Nuvetio-0\.5\.0\.pkg/);
  assert.match(copy, /Nuvetio 0\.5\.0/);
  assert.match(home, /releases\/download\/v0\.5\.0\/Nuvetio-0\.5\.0-Setup\.exe/);
  assert.match(home, /releases\/download\/v0\.5\.0\/Nuvetio-0\.5\.0\.pkg/);
  assert.match(notes, /^# Notas de la versión 0\.5\.0/m);
  assert.doesNotMatch(workflow, /0\.4\.0/);
});
