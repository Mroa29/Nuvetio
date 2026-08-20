import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("department catalog and public diagram expose the complete Nuvetio team", async () => {
  const catalog = JSON.parse(await readFile(path.join(ROOT, "departments/nuvetio-departments.json"), "utf8"));
  const diagram = await readFile(path.join(ROOT, "docs/assets/nuvetio-departments.svg"), "utf8");
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.equal(catalog.version, "0.5.0");
  assert.equal(catalog.departments.length, 10);
  for (const department of catalog.departments) {
    assert.ok(department.agents.length > 0, department.id);
    assert.ok(department.functions.length > 0, department.id);
    assert.ok(department.limits.length > 0, department.id);
    assert.match(diagram, new RegExp(department.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), department.id);
  }
  assert.match(home, /nuvetio-departments\.svg/);
  assert.match(home, /diagrama.*departamentos|departamentos.*diagrama/i);
});
