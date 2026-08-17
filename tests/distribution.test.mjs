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
  assert.match(home, new RegExp(copy.tagline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  for (const step of copy.installSteps) assert.ok(home.includes(step));
  assert.ok(home.includes(copy.example.userPrompt));
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
