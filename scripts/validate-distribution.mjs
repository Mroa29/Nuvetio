#!/usr/bin/env node
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REQUIRED_FILES = [
  ".agents/plugins/marketplace.json",
  ".github/workflows/validate.yml",
  "LICENSE",
  "package.json",
  "plugins/ai-team-core/.codex-plugin/plugin.json",
  "plugins/ai-team-core/README.md",
  "plugins/ai-team-core/skills/operate-ai-team-core/SKILL.md",
  "plugins/ai-team-core/skills/operate-ai-team-core/references/product-and-ai.md",
  "plugins/ai-team-core/skills/operate-ai-team-core/references/experience-and-mockups.md",
  "plugins/ai-team-core/skills/operate-ai-team-core/references/delivery-and-quality.md",
  "scripts/validate-distribution.mjs",
  "tests/distribution.test.mjs",
];

const IGNORED = new Set([".git", "node_modules", "coverage", "dist", "build"]);
const TEXT_EXTENSIONS = new Set(["", ".md", ".json", ".mjs", ".js", ".html", ".css", ".yml", ".yaml"]);
const SECRET_PATTERNS = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["OpenAI-style token", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
];
const PRIVATE_TERMS = [
  ["ERP", "Kronos"].join(" "),
  ["Flip", "private"].join(" "),
  ["memory", "decisions"].join("/"),
  ["socra", "OneDrive"].join("\\"),
];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && IGNORED.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  await visit(root);
  return files;
}

function display(root, target) {
  return path.relative(root, target).split(path.sep).join("/");
}

function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  return Object.fromEntries(
    match[1].split("\n").map((line) => {
      const separator = line.indexOf(":");
      return [line.slice(0, separator), line.slice(separator + 1).trim()];
    }),
  );
}

export async function validateDistribution(
  root,
  { requiredFiles = REQUIRED_FILES } = {},
) {
  const errors = [];
  for (const relative of requiredFiles) {
    if (!(await exists(path.join(root, relative)))) errors.push("Missing required file: " + relative);
  }

  const files = await collectFiles(root);
  for (const file of files) {
    const relative = display(root, file);
    if (relative === "plugins/ai-team-core/.mcp.json") {
      errors.push("Forbidden file: " + relative);
    }
    if (!TEXT_EXTENSIONS.has(path.extname(file))) continue;
    const source = await readFile(file, "utf8");
    for (const [name, pattern] of SECRET_PATTERNS) {
      if (pattern.test(source)) errors.push(relative + ": potential " + name);
    }
    for (const term of PRIVATE_TERMS) {
      if (source.includes(term)) {
        errors.push(relative + ": contains private distribution term '" + term + "'");
      }
    }
  }

  const manifestPath = path.join(root, "plugins/ai-team-core/.codex-plugin/plugin.json");
  if (await exists(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    if (manifest.name !== "ai-team-core") errors.push("Manifest name must be 'ai-team-core'");
    if (manifest.version !== "0.1.0") errors.push("Manifest version must be '0.1.0'");
    if (manifest.skills !== "./skills/") errors.push("Manifest skills must be './skills/'");
    if ("mcpServers" in manifest) errors.push("Manifest must not declare mcpServers");
  }

  for (const file of files.filter((candidate) => path.basename(candidate) === "SKILL.md")) {
    const metadata = parseFrontmatter(await readFile(file, "utf8"));
    const folder = path.basename(path.dirname(file));
    if (metadata.name !== folder) {
      errors.push(display(root, file) + ": skill name must match folder '" + folder + "'");
    }
  }

  return errors.sort();
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const errors = await validateDistribution(root);
  if (errors.length > 0) {
    console.error("Public distribution validation failed:");
    for (const error of errors) console.error("- " + error);
    process.exitCode = 1;
    return;
  }
  console.log("Public distribution validation passed.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
