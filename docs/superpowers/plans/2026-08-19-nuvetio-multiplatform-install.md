# Nuvetio Multiplatform Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Nuvetio installable with a double-click launcher on macOS and Windows while preparing the official ChatGPT Plugin submission path.

**Architecture:** Keep the existing skills-only plugin and local marketplace unchanged. Add thin platform launchers under `installers/` that invoke the existing Codex CLI commands against the unzipped package root, with explicit checks and no network or credential access. Update public copy and submission documentation to explain the two distribution paths.

**Tech Stack:** POSIX shell, Windows CMD/PowerShell, Node.js `node:test`, existing Nuvetio validator, Codex CLI plugin commands.

**Spec:** `docs/superpowers/specs/2026-08-19-nuvetio-multiplatform-install-design.md`

## Global Constraints

- Keep installation user-scoped; never require administrator privileges.
- Do not download or execute remote scripts during installation.
- Do not read, transmit, or store credentials.
- Do not claim ChatGPT availability until OpenAI approves and publishes the plugin.
- Preserve the current skills-only plugin manifest and marketplace schema.

### Task 1: Add tested platform launchers

**Files:**
- Create: `installers/macos/Instalar-Nuvetio.command`
- Create: `installers/windows/Instalar-Nuvetio.ps1`
- Create: `installers/windows/Instalar-Nuvetio.cmd`
- Test: `tests/distribution.test.mjs`

**Interfaces:**
- Each launcher consumes the unzipped Nuvetio package root containing `.agents/plugins/marketplace.json` and `plugins/nuvetio`.
- Each launcher produces an installed `nuvetio@nuvetio` plugin or a readable non-zero failure.

- [x] **Step 1: Write failing tests** asserting both platforms contain the package-root calculation, `codex plugin marketplace add`, `codex plugin add nuvetio@nuvetio`, missing-Codex handling, and no remote shell-pipe execution.
- [x] **Step 2: Run the focused test and verify it fails because the launcher files do not exist.**
- [x] **Step 3: Implement the minimal macOS and Windows launchers with user-scoped commands and explicit error messages.**
- [x] **Step 4: Run the focused test and verify it passes.**
- [x] **Step 5: Smoke-test each launcher against an isolated `CODEX_HOME` and the package root; verify the plugin reports version `0.2.1`.**

### Task 2: Update public onboarding and package contents (release 0.2.1)

**Files:**
- Modify: `content/public-copy.es.json`
- Modify: `docs/index.html`
- Modify: `docs/guia-rapida.html`
- Modify: `docs/soporte.html`
- Modify: `README.md`
- Modify: `tests/distribution.test.mjs`

**Interfaces:**
- Public copy exposes separate Mac and Windows double-click instructions and the current ChatGPT publication status.
- The downloadable package includes the launcher files at stable paths.

- [x] **Step 1: Add failing assertions for Mac/Windows launcher references and the absence of the old terminal-only framing.**
- [x] **Step 2: Run the focused onboarding test and verify it fails.**
- [x] **Step 3: Update the canonical copy and all public onboarding surfaces, keeping the ChatGPT directory limitation explicit.**
- [x] **Step 4: Run the focused test, `npm test`, and `npm run validate`; verify all pass.**
- [x] **Step 5: Bump the distribution to `0.2.1`, rebuild the generic delivery ZIP with both launcher paths, and validate its required entries.**

### Task 3: Prepare the official ChatGPT submission handoff

**Files:**
- Modify: `submission/checklist.md`
- Modify: `submission/listing.es.md`
- Create: `submission/openai-portal-handoff.md`

**Interfaces:**
- The handoff records the exact public listing URL, support/privacy/terms URLs, skills-only classification, test evidence, and the human-only portal steps.

- [x] **Step 1: Add a failing documentation assertion for the official submission portal, identity/access prerequisite, and current pending status.**
- [x] **Step 2: Run the focused submission test and verify it fails.**
- [x] **Step 3: Add the handoff document and update the checklist/listing without adding secrets or claiming approval.**
- [x] **Step 4: Run the focused test and full validation.**
- [x] **Step 5: Report the portal URL and the exact human action required; do not submit or publish without the user completing identity/access requirements.**

### Task 4: Final verification and release handoff

**Files:**
- No source changes beyond Tasks 1–3.

- [x] **Step 1: Run `npm test`, `npm run validate`, and `git diff --check`.**
- [x] **Step 2: Run isolated launcher smoke tests on the current host using a fake Codex CLI command without touching the user’s normal configuration.**
- [x] **Step 3: Inspect the diff for secrets, remote execution, misleading ChatGPT claims, and platform path errors.**
- [x] **Step 4: Verify the public site and ZIP locally; only then prepare the versioned `v0.2.1` release update.**
