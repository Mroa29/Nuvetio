import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);

test("public manifest and marketplace expose a skills-only Nuvetio plugin", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "plugins/nuvetio/.codex-plugin/plugin.json"), "utf8"),
  );
  const copy = JSON.parse(
    await readFile(path.join(ROOT, "content/public-copy.es.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    await readFile(path.join(ROOT, ".agents/plugins/marketplace.json"), "utf8"),
  );

  assert.equal(manifest.name, "nuvetio");
  assert.equal(manifest.version, "0.3.0");
  assert.equal(manifest.skills, "./skills/");
  assert.equal("mcpServers" in manifest, false);
  assert.equal(manifest.author.name, "Marcos Roa");
  assert.equal(manifest.interface.displayName, "Nuvetio");
  assert.equal(manifest.description, "Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.");
  assert.equal(manifest.interface.category, "Developer Tools");
  assert.deepEqual(manifest.interface.defaultPrompt, copy.prompts);

  const entry = marketplace.plugins.find(({ name }) => name === "nuvetio");
  assert.deepEqual(entry, {
    name: "nuvetio",
    source: { source: "local", path: "./plugins/nuvetio" },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Developer Tools",
  });
  const legacy = marketplace.plugins.find(({ name }) => name === "ai-team-core");
  assert.equal(legacy.policy.installation, "NOT_AVAILABLE");
  const migrationSkill = await readFile(
    path.join(ROOT, "plugins/ai-team-core/skills/migrate-to-nuvetio/SKILL.md"),
    "utf8",
  );
  assert.match(migrationSkill, /ahora se llama Nuvetio/i);
});

test("legacy migration package remains valid for plugin ingestion", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "plugins/ai-team-core/.codex-plugin/plugin.json"), "utf8"),
  );

  assert.equal(typeof manifest.author, "object");
  assert.match(manifest.author.name, /\S/);
  for (const field of ["longDescription", "developerName", "category"]) {
    assert.match(manifest.interface[field], /\S/, field);
  }
  assert.ok("defaultPrompt" in manifest.interface);
  assert.ok(Array.isArray(manifest.interface.capabilities));
  assert.ok(manifest.interface.capabilities.every((value) => typeof value === "string" && value.trim()));
});

test("orchestration skill supports products, AI, mockups, delivery, and safe fallbacks", async () => {
  const skill = await readFile(
    path.join(ROOT, "plugins/nuvetio/skills/operate-nuvetio/SKILL.md"),
    "utf8",
  );
  assert.match(skill, /^---\r?\nname: operate-nuvetio\r?\n/m);
  assert.match(skill, /pregunta como siempre/i);
  assert.match(skill, /product-and-ai\.md/);
  assert.match(skill, /experience-and-mockups\.md/);
  assert.match(skill, /delivery-and-quality\.md/);
  assert.match(skill, /wireframe textual/i);
  assert.match(skill, /autorizaci[oó]n/i);

  for (const file of [
    "product-and-ai.md",
    "experience-and-mockups.md",
    "delivery-and-quality.md",
  ]) {
    const source = await readFile(
      path.join(
        ROOT,
        "plugins/nuvetio/skills/operate-nuvetio/references",
        file,
      ),
      "utf8",
    );
    assert.ok(source.length > 300, file + " must contain an actionable workflow");
  }
});

test("mixed beginner product requests also route to the experience lane", async () => {
  const prompt = "Tengo una idea para crear un asistente con IA que ayude a nuestros clientes, pero no sé cómo diseñarlo. No modifiques archivos ni conectes servicios.";
  const skill = await readFile(
    path.join(ROOT, "plugins/nuvetio/skills/operate-nuvetio/SKILL.md"),
    "utf8",
  );

  assert.match(prompt, /asistente con IA.*cómo diseñarlo/i);
  assert.match(prompt, /No modifiques archivos ni conectes servicios\.$/);
  assert.match(
    skill,
    /combina.*product-and-ai\.md.*experience-and-mockups\.md/i,
    "mixed product and design requests must load both lanes",
  );
  assert.match(
    skill,
    /entrada.*decisiones.*éxito.*errores/i,
    "the experience response must cover the essential flow states",
  );
  assert.match(skill, /Riesgos y supuestos/i);
  assert.match(skill, /Siguiente paso/i);
  assert.match(skill, /autorización aplicable/i);
  assert.match(
    skill,
    /no detenerse solo en una aclaración.*borrador provisional/i,
    "mixed beginner requests must continue beyond clarification when enough context exists",
  );
  assert.match(
    skill,
    /supuestos razonables.*etiquetados/i,
    "the provisional response must disclose its assumptions",
  );
  assert.match(
    skill,
    /al final.*al menos una pregunta concreta.*siguiente paso/i,
    "the response must end with a concrete next-step question",
  );
});

test("site reuses the approved message and beginner installation flow", async () => {
  const copy = JSON.parse(
    await readFile(path.join(ROOT, "content/public-copy.es.json"), "utf8"),
  );
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.equal(copy.name, "Nuvetio");
  assert.equal(copy.tagline, "Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.");
  assert.equal(copy.installSteps.length, 4);
  assert.equal(copy.benefits.length, 6);
  assert.equal(copy.prompts.length, 3);
  assert.ok(copy.installSteps.some((step) => step.includes("instalador de Nuvetio 0.3.0")));
  assert.ok(copy.installSteps.some((step) => step.includes("Siguiente, Instalar y Finalizar")));
  assert.ok(copy.installSteps.some((step) => step.includes("todavía no está firmado")));
  assert.ok(copy.installSteps.some((step) => step.includes("instalación directa en ChatGPT estará disponible después")));
  assert.ok(copy.installSteps.every((step) => !step.includes("Busca Nuvetio, abre su ficha")));
  assert.match(home, new RegExp(copy.tagline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const step of copy.installSteps) assert.ok(home.includes(step));
  assert.ok(home.includes(copy.example.userPrompt));
});

test("platform installers provide a local, non-administrative Codex setup flow", async () => {
  const launchers = {
    macos: {
      path: path.join(ROOT, "installers/macos/Instalar-Nuvetio.command"),
      required: [
        /command -v codex/,
        /codex plugin marketplace add/,
        /codex plugin add [^\n]*nuvetio@nuvetio/,
        /Nuvetio.*instalado/i,
      ],
    },
    windowsPowerShell: {
      path: path.join(ROOT, "installers/windows/Instalar-Nuvetio.ps1"),
      required: [
        /Get-Command codex/,
        /plugin marketplace add/,
        /plugin add ['"]?nuvetio@nuvetio/,
        /Nuvetio.*instalado/i,
      ],
    },
    windowsCmd: {
      path: path.join(ROOT, "installers/windows/Instalar-Nuvetio.cmd"),
      required: [
        /where codex/i,
        /Instalar-Nuvetio\.ps1/i,
        /ExecutionPolicy Bypass/i,
      ],
    },
  };

  for (const [name, launcher] of Object.entries(launchers)) {
    const source = await readFile(launcher.path, "utf8");
    assert.ok(source.length > 100, `${name} launcher must contain an actionable flow`);
    for (const pattern of launcher.required) {
      assert.match(source, pattern, `${name} launcher is missing ${pattern}`);
    }
    assert.doesNotMatch(source, /curl\s+[^\n|]*\|\s*(sh|bash)|irm\s+[^\n|]*\|\s*iex/i);
    assert.doesNotMatch(source, /Start-Process\s+.*-Verb\s+RunAs/i);
  }
});

test("optional Agent Skills companion is attributed and explicitly confirmed", async () => {
  const metadata = JSON.parse(
    await readFile(path.join(ROOT, "addons/agent-skills.json"), "utf8"),
  );
  assert.equal(metadata.name, "agent-skills");
  assert.equal(metadata.version, "0.6.7");
  assert.equal(metadata.author, "Addy Osmani");
  assert.equal(metadata.license, "MIT");
  assert.equal(metadata.upstream, "https://github.com/addyosmani/agent-skills");
  assert.equal(metadata.marketplaceCommand, "codex plugin marketplace add https://github.com/addyosmani/agent-skills.git");
  assert.equal(metadata.pluginCommand, "codex plugin add agent-skills@agent-skills");

  const launchers = [
    "installers/macos/Instalar-Agent-Skills.command",
    "installers/windows/Instalar-Agent-Skills.ps1",
    "installers/windows/Instalar-Agent-Skills.cmd",
  ];
  for (const relative of launchers) {
    const source = await readFile(path.join(ROOT, relative), "utf8");
    assert.ok(source.length > 120, `${relative} must contain an actionable flow`);
    assert.match(source, /Agent Skills/i);
    assert.match(source, /addyosmani\/agent-skills/i);
    assert.match(source, /agent-skills@agent-skills/i);
    assert.match(source, /confirm|confirma|escribe.*si|read/i);
    assert.doesNotMatch(source, /curl\s+[^\n|]*\|\s*(sh|bash)|irm\s+[^\n|]*\|\s*iex/i);
    assert.doesNotMatch(source, /Start-Process\s+.*-Verb\s+RunAs/i);
  }

  for (const relative of [
    "installers/macos/Instalar-Nuvetio.command",
    "installers/windows/Instalar-Nuvetio.ps1",
    "installers/windows/Instalar-Nuvetio.cmd",
  ]) {
    const source = await readFile(path.join(ROOT, relative), "utf8");
    assert.doesNotMatch(source, /agent-skills/i, `${relative} must not auto-install the companion`);
  }
});

test("homepage presents the complete active Nuvetio team and mascot", async () => {
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.match(home, /mascot-nuvetio\.svg/);
  assert.match(home, /alt="Mascota de Nuvetio/i);
  assert.match(home, /id="equipo"/);
  for (const label of [
    "Orquestador Nuvetio",
    "Departamento de Ingeniería",
    "Engineering Agent",
    "Departamento de Producto e IA",
    "Product &amp; AI Agent",
    "Departamento de Experiencia",
    "Experience &amp; Mockups Agent",
    "Departamento de Calidad y Seguridad",
    "Quality &amp; Security Agent",
    "Skills",
    "MCP",
    "Memoria",
    "Validación",
    "Agent Skills",
    "Marketing",
    "Operaciones",
    "Finanzas",
    "Legal",
  ]) {
    assert.match(home, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), label);
  }
  assert.match(home, /todav[ií]a no son departamentos activos/i);
  assert.match(home, /no necesitas saber de inteligencia artificial/i);

  const mascot = await readFile(path.join(ROOT, "docs/assets/mascot-nuvetio.svg"), "utf8");
  assert.match(mascot, /<svg\b/);
  assert.match(mascot, /<title[^>]*>Nuvetio/i);
  assert.match(mascot, /viewBox=/i);
});

test("quick-start HTML fits a phone viewport while preserving the A4 print layout", async () => {
  const guide = await readFile(path.join(ROOT, "docs/guia-rapida.html"), "utf8");
  const mobile = guide.match(/@media screen and \(max-width: 760px\)\s*{([\s\S]*?)}\s*@media print/)?.[1];

  assert.ok(mobile, "the guide needs a screen-only mobile layout");
  assert.match(mobile, /body\s*{[^}]*width:\s*100%/);
  assert.match(mobile, /\.steps[^}]*grid-template-columns:\s*1fr/);
  assert.match(mobile, /\.benefits[^}]*grid-template-columns:\s*1fr/);
  assert.match(mobile, /\.prompts[^}]*grid-template-columns:\s*1fr/);
});

test("hero eyebrow normal text meets WCAG AA across the gradient", async () => {
  const css = await readFile(path.join(ROOT, "docs/styles.css"), "utf8");
  const variables = Object.fromEntries(
    [...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map((match) => [match[1], match[2]]),
  );
  const eyebrowVariable = css.match(/\.eyebrow\s*\{[^}]*color:\s*var\(--([\w-]+)\)/)?.[1];
  assert.ok(eyebrowVariable, "the eyebrow must use a declared color variable");

  function luminance(hex) {
    const channels = hex.match(/[\da-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function contrast(foreground, background) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  }

  for (const background of [variables.navy, variables.blue]) {
    const ratio = contrast(variables[eyebrowVariable], background);
    assert.ok(ratio >= 4.5, `eyebrow contrast ${ratio.toFixed(2)}:1 must be at least 4.5:1`);
  }
});

test("public package has no MCP configuration or external authentication requirement", async () => {
  await assert.rejects(
    readFile(path.join(ROOT, "plugins/nuvetio/.mcp.json"), "utf8"),
    { code: "ENOENT" },
  );
});

test("validator rejects MCP configuration and private project content", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-invalid-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "plugins/nuvetio"), { recursive: true });
  await writeFile(path.join(root, "plugins/nuvetio/.mcp.json"), "{}", "utf8");
  const forbiddenTerm = ["ERP", "Kronos"].join(" ");
  await writeFile(path.join(root, "internal.md"), forbiddenTerm + " private memory", "utf8");

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "Forbidden file: plugins/nuvetio/.mcp.json",
    "internal.md: contains private distribution term '" + forbiddenTerm + "'",
  ]);
});

test("validator reports a malformed plugin manifest without throwing", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-invalid-manifest-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifestDirectory = path.join(root, "plugins/nuvetio/.codex-plugin");
  await mkdir(manifestDirectory, { recursive: true });
  await writeFile(path.join(manifestDirectory, "plugin.json"), "{ invalid json", "utf8");

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "plugins/nuvetio/.codex-plugin/plugin.json: invalid JSON",
  ]);
});

test("validator requires the plugin manifest to be a JSON object", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-non-object-manifest-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifestDirectory = path.join(root, "plugins/nuvetio/.codex-plugin");
  const manifestPath = path.join(manifestDirectory, "plugin.json");
  await mkdir(manifestDirectory, { recursive: true });

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  for (const source of ["null", "false", "0", '\"\"', "[]"]) {
    await writeFile(manifestPath, source, "utf8");
    const errors = await validateDistribution(root, { requiredFiles: [] });
    assert.deepEqual(errors, [
      "plugins/nuvetio/.codex-plugin/plugin.json: manifest must be a JSON object",
    ]);
  }
});

test("validator reports missing relative HTML targets", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-links-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs/index.html"),
    '<link rel="stylesheet" href="./styles.css">',
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "docs/index.html: missing link target './styles.css'",
  ]);
});

test("validator requires an existing local favicon on each public HTML page", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-favicon-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const assets = path.join(root, "docs/assets");
  await mkdir(assets, { recursive: true });
  await writeFile(path.join(assets, "logo-nuvetio-1024.png"), "png", "utf8");
  await writeFile(
    path.join(root, "docs/index.html"),
    '<link rel="icon" type="image/png" href="./assets/logo-nuvetio-1024.png">',
    "utf8",
  );
  await writeFile(path.join(root, "docs/soporte.html"), "<title>Soporte</title>", "utf8");
  await writeFile(
    path.join(root, "docs/privacidad.html"),
    '<link rel="icon" href="https://example.com/favicon.png">',
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "docs/privacidad.html: missing local favicon declaration",
    "docs/soporte.html: missing local favicon declaration",
  ]);
});

test("validator reports drift from canonical public copy", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-copy-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content"), { recursive: true });
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "content/public-copy.es.json"),
    JSON.stringify({
      tagline: "Approved tagline",
      installSteps: ["Install"],
      benefits: ["Benefit"],
      prompts: ["Prompt"],
      example: { userPrompt: "Question", outcome: "Outcome" },
    }),
    "utf8",
  );
  await writeFile(path.join(root, "docs/index.html"), "<h1>Stale copy</h1>", "utf8");

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "docs/index.html: approved public copy is out of date",
  ]);
});

test("validator rejects remote scripts, insecure assets, analytics, and tracking pixels", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-tracking-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs/index.html"),
    '<img src="http://example.com/pixel.gif" width="1" height="1"><script src="https://example.com/remote.js"></script><p>google-analytics</p>',
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.ok(errors.some((error) => error.includes("insecure remote asset")));
  assert.ok(errors.some((error) => error.includes("remote script")));
  assert.ok(errors.some((error) => error.includes("analytics")));
  assert.ok(errors.some((error) => error.includes("tracking pixel")));
});

test("public landing page offers the Windows native installer", async () => {
  const html = await readFile(path.join(ROOT, "docs/index.html"), "utf8");

  assert.match(
    html,
    /href="https:\/\/github\.com\/Mroa29\/Nuvetio\/releases\/download\/v0\.3\.0\/Nuvetio-0\.3\.0-Setup\.exe"[^>]*>Descargar instalador para Windows<\/a>/,
  );
});

test("native installer sources are versioned, local, and covered by CI", async () => {
  const metadata = JSON.parse(
    await readFile(path.join(ROOT, "packaging/native-installer.json"), "utf8"),
  );
  assert.equal(metadata.version, "0.3.0");
  assert.deepEqual(metadata.artifacts, [
    "Nuvetio-0.3.0-Setup.exe",
    "Nuvetio-0.3.0.pkg",
  ]);

  const files = {
    windows: "scripts/build-windows-installer.ps1",
    macos: "scripts/build-macos-installer.sh",
    postinstall: "packaging/macos/postinstall",
    workflow: ".github/workflows/build-installers.yml",
  };
  const sources = {};
  for (const [name, relative] of Object.entries(files)) {
    sources[name] = await readFile(path.join(ROOT, relative), "utf8");
    assert.ok(sources[name].length > 120, `${relative} must be actionable`);
    assert.doesNotMatch(sources[name], /curl\s+[^\n|]*\|\s*(sh|bash)|irm\s+[^\n|]*\|\s*iex/i);
  }
  assert.match(sources.windows, /iexpress/i);
  assert.match(sources.windows, /Instalar-Nuvetio\.ps1/);
  assert.match(sources.macos, /pkgbuild/);
  assert.match(sources.postinstall, /codex/);
  assert.match(sources.workflow, /windows-latest/);
  assert.match(sources.workflow, /macos-latest/);
  assert.match(sources.workflow, /npm test/);
});

test("homepage exposes native installers and hides the ZIP fallback", async () => {
  const html = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.match(html, /Nuvetio-0\.3\.0-Setup\.exe/);
  assert.match(html, /Nuvetio-0\.3\.0\.pkg/);
  assert.match(html, /guia-rapida-nuvetio\.pdf/);
  assert.doesNotMatch(html, /releases\/download\/v0\.3\.0\/Nuvetio-0\.3\.0\.zip/);
});

test("validator resolves unquoted href and src attributes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-unquoted-links-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs/index.html"),
    "<link href=./missing.css><img src=./missing.png alt=\"\">",
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "docs/index.html: missing link target './missing.css'",
    "docs/index.html: missing link target './missing.png'",
  ]);
});

test("validator preserves the first duplicate HTML attribute like browsers", async (t) => {
  const fixtures = [
    {
      name: "missing source",
      html: "<img src=./missing.png src=./local.png alt=\"\">",
      expected: ["docs/index.html: missing link target './missing.png'"],
    },
    {
      name: "remote script",
      html: "<script src=https://example.com/remote.js src=./local.js></script>",
      expected: ["docs/index.html: contains remote script"],
    },
    {
      name: "insecure asset",
      html: "<img src=http://example.com/remote.png src=./local.png alt=\"\">",
      expected: ["docs/index.html: contains insecure remote asset"],
    },
    {
      name: "tracking pixel style",
      html: '<img src="https://example.com/pixel.gif" style="width:1px;height:1px" style="width:20px;height:20px" alt="">',
      expected: ["docs/index.html: contains tracking pixel"],
    },
  ];
  const actual = [];

  for (const fixture of fixtures) {
    const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-duplicates-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(path.join(root, "docs/index.html"), fixture.html, "utf8");
    await writeFile(path.join(root, "docs/local.js"), "", "utf8");
    await writeFile(path.join(root, "docs/local.png"), "", "utf8");

    const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
    actual.push({
      name: fixture.name,
      errors: await validateDistribution(root, { requiredFiles: [] }),
    });
  }

  assert.deepEqual(
    actual,
    fixtures.map(({ name, expected }) => ({ name, errors: expected })),
  );
});

test("validator rejects insecure CSS url assets", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-css-assets-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs/styles.css"),
    ".hero { background-image: url(http://example.com/hero.png); }",
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, ["docs/styles.css: contains insecure remote asset"]);
});

test("validator rejects tracking pixels sized through inline styles", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-style-pixel-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs/index.html"),
    '<img src="https://example.com/pixel.gif" style="width: 1px; height: 1px" alt="">',
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, ["docs/index.html: contains tracking pixel"]);
});

test("validator requires manifest starter prompts to use canonical public copy", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-prompts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content"), { recursive: true });
  await mkdir(path.join(root, "plugins/nuvetio/.codex-plugin"), { recursive: true });
  await writeFile(
    path.join(root, "content/public-copy.es.json"),
    JSON.stringify({ prompts: ["Approved starter prompt"] }),
    "utf8",
  );
  await writeFile(
    path.join(root, "plugins/nuvetio/.codex-plugin/plugin.json"),
    JSON.stringify({
      name: "nuvetio",
      version: "0.3.0",
      skills: "./skills/",
      interface: { defaultPrompt: ["Different prompt"] },
    }),
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, ["Manifest defaultPrompt must use approved starter prompts"]);
});

test("validator rejects release notes whose heading disagrees with the package version", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "nuvetio-release-version-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "submission"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ version: "0.3.0" }),
    "utf8",
  );
  await writeFile(
    path.join(root, "submission/release-notes.md"),
    "# Notas de la versión 0.1.0\n",
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  assert.deepEqual(await validateDistribution(root, { requiredFiles: [] }), [
    "submission/release-notes.md: heading must match package version 0.3.0",
  ]);
});

test("downloadable guide is a single-page PDF", async () => {
  const pdf = await readFile(
    path.join(ROOT, "docs/downloads/guia-rapida-nuvetio.pdf"),
  );
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  const source = pdf.toString("latin1");
  const pages = [...source.matchAll(/\/Type\s*\/Page\b/g)];
  assert.equal(pages.length, 1);
});

test("validator rejects invalid and multi-page downloadable guides", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-pdf-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const downloads = path.join(root, "docs/downloads");
  const guide = path.join(downloads, "guia-rapida-nuvetio.pdf");
  await mkdir(downloads, { recursive: true });

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");

  await writeFile(guide, "not a PDF", "latin1");
  assert.deepEqual(await validateDistribution(root, { requiredFiles: [] }), [
    "docs/downloads/guia-rapida-nuvetio.pdf: invalid PDF header",
  ]);

  await writeFile(
    guide,
    "%PDF-1.7\n/Type /Page\n/Type /Page\n",
    "latin1",
  );
  assert.deepEqual(await validateDistribution(root, { requiredFiles: [] }), [
    "docs/downloads/guia-rapida-nuvetio.pdf: must contain exactly one page (found 2)",
  ]);
});
