#!/usr/bin/env node
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REQUIRED_FILES = [
  ".agents/plugins/marketplace.json",
  ".github/workflows/validate.yml",
  "LICENSE",
  "README.md",
  "content/public-copy.es.json",
  "docs/assets/logo-nuvetio-1024.png",
  "docs/assets/mascot-nuvetio.svg",
  "docs/downloads/guia-rapida-nuvetio.pdf",
  "docs/guia-rapida.html",
  "docs/index.html",
  "docs/privacidad.html",
  "docs/soporte.html",
  "docs/styles.css",
  "docs/terminos.html",
  "package.json",
  "plugins/nuvetio/.codex-plugin/plugin.json",
  "plugins/nuvetio/README.md",
  "plugins/nuvetio/skills/operate-nuvetio/SKILL.md",
  "plugins/nuvetio/skills/operate-nuvetio/references/product-and-ai.md",
  "plugins/nuvetio/skills/operate-nuvetio/references/experience-and-mockups.md",
  "plugins/nuvetio/skills/operate-nuvetio/references/delivery-and-quality.md",
  "addons/agent-skills.json",
  "packaging/native-installer.json",
  "packaging/macos/postinstall",
  "scripts/build-windows-installer.ps1",
  "scripts/build-macos-installer.sh",
  ".github/workflows/build-installers.yml",
  "installers/macos/Instalar-Agent-Skills.command",
  "installers/windows/Instalar-Agent-Skills.ps1",
  "installers/windows/Instalar-Agent-Skills.cmd",
  "plugins/ai-team-core/.codex-plugin/plugin.json",
  "plugins/ai-team-core/skills/migrate-to-nuvetio/SKILL.md",
  "scripts/validate-distribution.mjs",
  "submission/checklist.md",
  "submission/listing.es.md",
  "submission/release-notes.md",
  "submission/starter-prompts.es.json",
  "submission/test-cases.json",
  "tests/distribution.test.mjs",
  "tests/submission.test.mjs",
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
const HTML_TAG_PATTERN = /<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
const HTML_ATTRIBUTE_PATTERN = /\b([a-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
const HTML_ASSET_ELEMENTS = new Set(["audio", "embed", "iframe", "img", "link", "source", "video"]);
const CSS_INSECURE_REMOTE_ASSET_PATTERN = /url\(\s*(?:["']\s*)?http:\/\//i;
const ANALYTICS_PATTERN = /google-analytics|googletagmanager|gtag\s*\(|mixpanel|segment\.com|amplitude/i;

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

function isLocalReference(reference) {
  return !(
    reference === "" ||
    reference.startsWith("#") ||
    reference.startsWith("/") ||
    reference.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(reference)
  );
}

function parseHtmlAttributes(source) {
  const attributes = new Map();
  HTML_ATTRIBUTE_PATTERN.lastIndex = 0;
  for (const match of source.matchAll(HTML_ATTRIBUTE_PATTERN)) {
    const name = match[1].toLowerCase();
    if (!attributes.has(name)) attributes.set(name, match[2] ?? match[3] ?? match[4]);
  }
  return attributes;
}

function parseHtmlTags(source) {
  HTML_TAG_PATTERN.lastIndex = 0;
  return [...source.matchAll(HTML_TAG_PATTERN)].map((match) => ({
    name: match[1].toLowerCase(),
    attributes: parseHtmlAttributes(match[2]),
  }));
}

function inlineStyleValue(style, property) {
  const match = style.match(new RegExp("(?:^|;)\\s*" + property + "\\s*:\\s*([^;]+)", "i"));
  return match?.[1].replace(/\s*!important\s*$/i, "").trim();
}

function isOnePixel(value) {
  return /^1(?:\.0+)?(?:px)?$/i.test(value ?? "");
}

function hasLocalFavicon(source) {
  return parseHtmlTags(source).some(({ name, attributes }) =>
    name === "link" &&
    (attributes.get("rel") ?? "").toLowerCase().split(/\s+/).includes("icon") &&
    isLocalReference(attributes.get("href") ?? ""),
  );
}

async function validateHtmlReferences(root, file, source, errors) {
  for (const { attributes } of parseHtmlTags(source)) {
    for (const attribute of ["href", "src"]) {
      const reference = attributes.get(attribute);
      if (reference === undefined || !isLocalReference(reference)) continue;
      const cleanReference = reference.split(/[?#]/, 1)[0];
      const target = path.resolve(path.dirname(file), cleanReference);
      if (!(await exists(target))) {
        errors.push(display(root, file) + ": missing link target '" + reference + "'");
      }
    }
  }
}

function validateHtmlSafety(root, file, source, errors) {
  const relative = display(root, file);
  let hasInsecureRemoteAsset = false;
  let hasRemoteScript = false;
  let hasTrackingPixel = false;
  for (const { name, attributes } of parseHtmlTags(source)) {
    const references = [attributes.get("href"), attributes.get("src")].filter(Boolean);
    if (HTML_ASSET_ELEMENTS.has(name) && references.some((value) => /^http:\/\//i.test(value))) {
      hasInsecureRemoteAsset = true;
    }
    if (name === "script" && /^(?:https?:)?\/\//i.test(attributes.get("src") ?? "")) {
      hasRemoteScript = true;
    }
    if (name === "img") {
      const style = attributes.get("style") ?? "";
      const width = inlineStyleValue(style, "width") ?? attributes.get("width");
      const height = inlineStyleValue(style, "height") ?? attributes.get("height");
      if (isOnePixel(width) && isOnePixel(height)) hasTrackingPixel = true;
    }
  }
  if (hasInsecureRemoteAsset) errors.push(relative + ": contains insecure remote asset");
  if (hasRemoteScript) errors.push(relative + ": contains remote script");
  if (ANALYTICS_PATTERN.test(source)) {
    errors.push(relative + ": contains analytics integration");
  }
  if (hasTrackingPixel) errors.push(relative + ": contains tracking pixel");
}

function validateCssSafety(root, file, source, errors) {
  if (CSS_INSECURE_REMOTE_ASSET_PATTERN.test(source)) {
    errors.push(display(root, file) + ": contains insecure remote asset");
  }
}

async function validateApprovedPublicCopy(root, errors) {
  const copyPath = path.join(root, "content/public-copy.es.json");
  const homePath = path.join(root, "docs/index.html");
  if (!(await exists(copyPath)) || !(await exists(homePath))) return;

  let copy;
  try {
    copy = JSON.parse(await readFile(copyPath, "utf8"));
  } catch {
    errors.push("content/public-copy.es.json: invalid JSON");
    return;
  }

  const home = await readFile(homePath, "utf8");
  const approved = [
    copy?.tagline,
    ...(Array.isArray(copy?.installSteps) ? copy.installSteps : []),
    ...(Array.isArray(copy?.benefits) ? copy.benefits : []),
    ...(Array.isArray(copy?.prompts) ? copy.prompts : []),
    copy?.example?.userPrompt,
    copy?.example?.outcome,
  ];
  const hasExpectedShape =
    typeof copy?.tagline === "string" &&
    Array.isArray(copy?.installSteps) &&
    Array.isArray(copy?.benefits) &&
    Array.isArray(copy?.prompts) &&
    typeof copy?.example?.userPrompt === "string" &&
    typeof copy?.example?.outcome === "string";
  if (!hasExpectedShape || !approved.every((value) => home.includes(value))) {
    errors.push("docs/index.html: approved public copy is out of date");
  }
}

async function validateDownloadableGuide(root, errors) {
  const guidePath = path.join(root, "docs/downloads/guia-rapida-nuvetio.pdf");
  if (!(await exists(guidePath))) return;

  const pdf = await readFile(guidePath);
  const relative = display(root, guidePath);
  if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    errors.push(relative + ": invalid PDF header");
    return;
  }

  const source = pdf.toString("latin1");
  const pageCount = [...source.matchAll(/\/Type\s*\/Page\b/g)].length;
  if (pageCount !== 1) {
    errors.push(relative + ": must contain exactly one page (found " + pageCount + ")");
  }
}

async function validateReleaseNotesVersion(root, errors) {
  const packagePath = path.join(root, "package.json");
  const notesPath = path.join(root, "submission/release-notes.md");
  if (!(await exists(packagePath)) || !(await exists(notesPath))) return;

  let packageJson;
  try {
    packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  } catch {
    return;
  }
  if (typeof packageJson?.version !== "string" || packageJson.version.length === 0) return;

  const notes = await readFile(notesPath, "utf8");
  const headingVersion = notes.match(/^# Notas de la versión (\S+)\s*$/m)?.[1];
  if (headingVersion !== packageJson.version) {
    errors.push(
      "submission/release-notes.md: heading must match package version " +
        packageJson.version,
    );
  }
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
  const requiresPublicFavicon = await exists(
    path.join(root, "docs/assets/logo-nuvetio-1024.png"),
  );
  for (const file of files) {
    const relative = display(root, file);
    if (relative === "plugins/nuvetio/.mcp.json") {
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

  for (const file of files.filter((candidate) => path.extname(candidate) === ".html")) {
    const source = await readFile(file, "utf8");
    await validateHtmlReferences(root, file, source, errors);
    validateHtmlSafety(root, file, source, errors);
    if (
      requiresPublicFavicon &&
      display(root, file).startsWith("docs/") &&
      !hasLocalFavicon(source)
    ) {
      errors.push(display(root, file) + ": missing local favicon declaration");
    }
  }
  for (const file of files.filter((candidate) => path.extname(candidate) === ".css")) {
    validateCssSafety(root, file, await readFile(file, "utf8"), errors);
  }
  await validateApprovedPublicCopy(root, errors);
  await validateDownloadableGuide(root, errors);
  await validateReleaseNotesVersion(root, errors);

  const manifestPath = path.join(root, "plugins/nuvetio/.codex-plugin/plugin.json");
  if (await exists(manifestPath)) {
    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch {
      errors.push(display(root, manifestPath) + ": invalid JSON");
    }
    if (manifest !== undefined && (manifest === null || Array.isArray(manifest) || typeof manifest !== "object")) {
      errors.push(display(root, manifestPath) + ": manifest must be a JSON object");
    } else if (manifest !== undefined) {
      if (manifest.name !== "nuvetio") errors.push("Manifest name must be 'nuvetio'");
      if (manifest.version !== "0.3.0") errors.push("Manifest version must be '0.3.0'");
      if (manifest.skills !== "./skills/") errors.push("Manifest skills must be './skills/'");
      if ("mcpServers" in manifest) errors.push("Manifest must not declare mcpServers");
      const copyPath = path.join(root, "content/public-copy.es.json");
      if (await exists(copyPath)) {
        let copy;
        try {
          copy = JSON.parse(await readFile(copyPath, "utf8"));
        } catch {
          copy = undefined;
        }
        if (
          Array.isArray(copy?.prompts) &&
          JSON.stringify(manifest.interface?.defaultPrompt) !== JSON.stringify(copy.prompts)
        ) {
          errors.push("Manifest defaultPrompt must use approved starter prompts");
        }
      }
    }
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
