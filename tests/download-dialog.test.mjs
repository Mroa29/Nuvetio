import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("download dialog invites an optional GitHub star without blocking downloads", async () => {
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  const script = await readFile(path.join(ROOT, "docs/download-dialog.js"), "utf8");
  await access(path.join(ROOT, "docs/assets/nuvetio-team-infographic.png"));

  assert.match(home, /<dialog[^>]+id="download-dialog"/i);
  assert.match(home, /Aceptar y abrir GitHub/i);
  assert.match(home, /Continuar sin valorar/i);
  assert.match(home, /download-dialog\.js/);
  assert.match(home, /nuvetio-team-infographic\.png/);
  assert.match(script, /showModal\(\)/);
  assert.match(home, /github\.com\/Mroa29\/Nuvetio/);
  assert.match(script, /download|location/i);
  assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|localStorage|telemetry/i);
});
