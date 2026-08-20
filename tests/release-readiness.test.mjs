import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("release candidate is explicit about unsigned artifacts and pending submission/video", async () => {
  const metadata = JSON.parse(await readFile(path.join(ROOT, "packaging/native-installer.json"), "utf8"));
  const workflow = await readFile(path.join(ROOT, ".github/workflows/sign-installers.yml"), "utf8");
  const signing = await readFile(path.join(ROOT, "packaging/signing/README.md"), "utf8");
  const handoff = await readFile(path.join(ROOT, "submission/openai-portal-handoff.md"), "utf8");
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.equal(metadata.version, "0.5.0");
  assert.equal(metadata.video, "DEFERRED");
  assert.equal(metadata.openAiDistribution, "NOT SUBMITTED");
  assert.equal(metadata.signing.status, "UNSIGNED");
  assert.match(workflow, /APPLE_CERTIFICATE|WINDOWS_CERTIFICATE/);
  assert.match(workflow, /if.*secret|secrets\./i);
  assert.match(workflow, /unsigned/i);
  assert.match(signing, /no.*certificado|unsigned/i);
  assert.match(handoff, /NOT SUBMITTED/);
  assert.match(home, /video.*pendiente|pendiente.*video/i);
  assert.doesNotMatch(home, /firmado digitalmente|notarizado|signed successfully/i);
});
