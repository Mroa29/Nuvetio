import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const departments = [
  { id: "marketing", reference: "marketing.md", trigger: /marketing|posicionamiento|audiencia/i },
  { id: "operaciones", reference: "operations.md", trigger: /operaciones|proceso|SOP|RACI/i },
  { id: "finanzas", reference: "finance.md", trigger: /finanzas|presupuesto|costo/i },
  { id: "legal", reference: "legal.md", trigger: /legal|contrato|cumplimiento/i },
];

test("roadmap departments are active consultive routes with explicit limits", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "departments/nuvetio-departments.json"), "utf8"));
  const skill = await readFile(path.join(ROOT, "plugins/nuvetio/skills/operate-nuvetio/SKILL.md"), "utf8");
  for (const expected of departments) {
    const department = catalog.departments.find(({ id }) => id === expected.id);
    assert.equal(department?.status, "active-consultive", expected.id);
    assert.ok(department?.limits?.length, expected.id);
    await access(path.join(ROOT, "plugins/nuvetio/skills/operate-nuvetio/references", expected.reference));
    assert.match(skill, expected.trigger, expected.id);
  }
  assert.match(skill, /no ejecutar.*(campañas|procesos|dinero|documentos)|no reemplaza.*profesional/i);
});
