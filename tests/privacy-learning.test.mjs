import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public privacy copy explains shared learning controls", async () => {
  const privacy = await readFile(path.join(ROOT, "docs/privacidad.html"), "utf8");
  assert.match(privacy, /consentimiento.*local|aprendizaje local/i);
  assert.match(privacy, /compartido.*anonim|anonim.*compartido/i);
  assert.match(privacy, /90 d[ií]as/i);
  assert.match(privacy, /eliminar|revocar/i);
  assert.match(privacy, /revisi[oó]n humana/i);
  assert.match(privacy, /no.*modifica.*modelo|no.*entrenamiento autom[aá]tico/i);
});
