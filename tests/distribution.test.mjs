import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("public manifest and marketplace expose a skills-only AI Team Core plugin", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "plugins/ai-team-core/.codex-plugin/plugin.json"), "utf8"),
  );
  const copy = JSON.parse(
    await readFile(path.join(ROOT, "content/public-copy.es.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    await readFile(path.join(ROOT, ".agents/plugins/marketplace.json"), "utf8"),
  );

  assert.equal(manifest.name, "ai-team-core");
  assert.equal(manifest.version, "0.1.0");
  assert.equal(manifest.skills, "./skills/");
  assert.equal("mcpServers" in manifest, false);
  assert.equal(manifest.author.name, "Marcos Roa");
  assert.equal(manifest.interface.displayName, "AI Team Core");
  assert.equal(manifest.interface.category, "Developer Tools");
  assert.deepEqual(manifest.interface.defaultPrompt, copy.prompts);

  const entry = marketplace.plugins.find(({ name }) => name === "ai-team-core");
  assert.deepEqual(entry, {
    name: "ai-team-core",
    source: { source: "local", path: "./plugins/ai-team-core" },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Developer Tools",
  });
});

test("orchestration skill supports products, AI, mockups, delivery, and safe fallbacks", async () => {
  const skill = await readFile(
    path.join(ROOT, "plugins/ai-team-core/skills/operate-ai-team-core/SKILL.md"),
    "utf8",
  );
  assert.match(skill, /^---\r?\nname: operate-ai-team-core\r?\n/m);
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
        "plugins/ai-team-core/skills/operate-ai-team-core/references",
        file,
      ),
      "utf8",
    );
    assert.ok(source.length > 300, file + " must contain an actionable workflow");
  }
});

test("site reuses the approved message and beginner installation flow", async () => {
  const copy = JSON.parse(
    await readFile(path.join(ROOT, "content/public-copy.es.json"), "utf8"),
  );
  const home = await readFile(path.join(ROOT, "docs/index.html"), "utf8");
  assert.equal(copy.tagline, "Pregunta como siempre. Construye como un equipo profesional.");
  assert.equal(copy.installSteps.length, 4);
  assert.equal(copy.benefits.length, 6);
  assert.equal(copy.prompts.length, 3);
  assert.ok(copy.installSteps.some((step) => step.includes("ChatGPT web")));
  assert.ok(copy.installSteps.some((step) => step.includes("/plugins")));
  assert.ok(copy.installSteps.some((step) => step.includes("extensión IDE")));
  assert.match(home, new RegExp(copy.tagline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const step of copy.installSteps) assert.ok(home.includes(step));
  assert.ok(home.includes(copy.example.userPrompt));
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
    readFile(path.join(ROOT, "plugins/ai-team-core/.mcp.json"), "utf8"),
    { code: "ENOENT" },
  );
});

test("validator rejects MCP configuration and private project content", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-invalid-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "plugins/ai-team-core"), { recursive: true });
  await writeFile(path.join(root, "plugins/ai-team-core/.mcp.json"), "{}", "utf8");
  const forbiddenTerm = ["ERP", "Kronos"].join(" ");
  await writeFile(path.join(root, "internal.md"), forbiddenTerm + " private memory", "utf8");

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "Forbidden file: plugins/ai-team-core/.mcp.json",
    "internal.md: contains private distribution term '" + forbiddenTerm + "'",
  ]);
});

test("validator reports a malformed plugin manifest without throwing", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-invalid-manifest-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifestDirectory = path.join(root, "plugins/ai-team-core/.codex-plugin");
  await mkdir(manifestDirectory, { recursive: true });
  await writeFile(path.join(manifestDirectory, "plugin.json"), "{ invalid json", "utf8");

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, [
    "plugins/ai-team-core/.codex-plugin/plugin.json: invalid JSON",
  ]);
});

test("validator requires the plugin manifest to be a JSON object", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-team-core-public-non-object-manifest-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifestDirectory = path.join(root, "plugins/ai-team-core/.codex-plugin");
  const manifestPath = path.join(manifestDirectory, "plugin.json");
  await mkdir(manifestDirectory, { recursive: true });

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  for (const source of ["null", "false", "0", '\"\"', "[]"]) {
    await writeFile(manifestPath, source, "utf8");
    const errors = await validateDistribution(root, { requiredFiles: [] });
    assert.deepEqual(errors, [
      "plugins/ai-team-core/.codex-plugin/plugin.json: manifest must be a JSON object",
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
  await mkdir(path.join(root, "plugins/ai-team-core/.codex-plugin"), { recursive: true });
  await writeFile(
    path.join(root, "content/public-copy.es.json"),
    JSON.stringify({ prompts: ["Approved starter prompt"] }),
    "utf8",
  );
  await writeFile(
    path.join(root, "plugins/ai-team-core/.codex-plugin/plugin.json"),
    JSON.stringify({
      name: "ai-team-core",
      version: "0.1.0",
      skills: "./skills/",
      interface: { defaultPrompt: ["Different prompt"] },
    }),
    "utf8",
  );

  const { validateDistribution } = await import("../scripts/validate-distribution.mjs");
  const errors = await validateDistribution(root, { requiredFiles: [] });
  assert.deepEqual(errors, ["Manifest defaultPrompt must use approved starter prompts"]);
});
