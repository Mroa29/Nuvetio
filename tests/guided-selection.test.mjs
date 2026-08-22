import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("homepage offers friendly button-style support selection", async () => {
  const html = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  const css = await readFile(path.join(ROOT, "docs/styles.css"), "utf8");

  assert.match(html, /id="seleccion-guiada"/);
  assert.match(html, /Elige el apoyo que necesitas/i);
  assert.match(html, /data-agent-selection="recommended"/);
  assert.match(html, /data-agent-selection="marketing"/);
  assert.match(html, /data-agent-selection="producto"/);
  assert.match(html, /data-agent-selection="experiencia"/);
  assert.match(html, /data-agent-selection="finanzas"/);
  assert.match(html, /data-agent-selection="legal"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /id="selection-preview"/);
  assert.match(html, /Continuar con estos apoyos/i);
  assert.match(css, /\.selection-panel/);
  assert.match(css, /\.selection-chip/);
});

test("Nuvetio conversation flow confirms intent before spending tokens", async () => {
  const skill = await readFile(
    path.join(ROOT, "plugins/nuvetio/skills/operate-nuvetio/SKILL.md"),
    "utf8",
  );
  const claudeAdapter = await readFile(
    path.join(ROOT, "adapters/claude/skills/nuvetio/SKILL.md"),
    "utf8",
  );

  assert.match(skill, /confirmar lo que entend(?:io|i[oó])/i);
  assert.match(skill, /sugerir.*apoyos/i);
  assert.match(skill, /uno o m[aá]s/i);
  assert.match(skill, /validar.*elecci[oó]n.*ejemplo breve/i);
  assert.match(skill, /opciones numeradas/i);
  assert.match(skill, /menor costo en tokens y tiempo/i);
  assert.match(claudeAdapter, /selecci[oó]n guiada/i);
});
