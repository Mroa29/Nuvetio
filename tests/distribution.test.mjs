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
