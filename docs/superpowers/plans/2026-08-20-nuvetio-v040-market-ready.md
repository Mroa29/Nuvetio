# Nuvetio 0.4.0 Market-Ready Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Nuvetio 0.4.0 as a market-ready, skills-only distribution compatible with Codex CLI/Desktop and Claude Code, with tolerant installers, an expanded department team, optional Agent Skills, and a consent-first learning foundation; the launch video remains deferred.

**Architecture:** Keep `plugins/nuvetio/skills/operate-nuvetio/SKILL.md` as the runtime-neutral source. Add thin Codex and Claude adapters, a local-first learning pipeline, a declarative department catalog used by the page and orchestrator, and platform installers that copy payloads before attempting optional activation. Signing and ChatGPT publication remain evidence-gated release steps.

**Tech Stack:** Node.js 20, `node:test`, PowerShell, POSIX shell, JSON, static HTML/CSS/SVG, GitHub Actions, local filesystem queue; no new runtime dependency and no MCP/backend requirement for the base install.

**Spec:** `docs/superpowers/specs/2026-08-20-nuvetio-v040-complete-design.md`

## Global Constraints

- Version is `0.4.0`; release tag is `v0.4.0` only after local and CI gates pass.
- Video is explicitly deferred and must not be advertised as available in v0.4.0.
- Canonical skills remain provider-neutral; Codex and Claude adapters may not fork orchestration logic.
- Agent Skills is bundled as an optional, consent-gated companion with upstream attribution and MIT license.
- No credentials, conversation transcripts, tokens, private paths, telemetry, MCP configuration, or remote code execution are added to the public package.
- Codex CLI, Codex Desktop, Claude Code, and ChatGPT are separate surfaces; absence of one must not break installation for another.
- Finance and Legal departments are advisory and must display their professional-boundary disclaimers.
- Production signing, notarization, and OpenAI portal publication require real credentials/review evidence and cannot be simulated.
- Every task ends with a focused test, `npm test`, `npm run validate`, or an explicit external-evidence gate.

---

### Task 1: Establish the 0.4.0 contract and RED coverage

**Files:**
- Modify: `package.json`
- Modify: `plugins/nuvetio/.codex-plugin/plugin.json`
- Modify: `content/public-copy.es.json`
- Modify: `packaging/native-installer.json`
- Modify: `submission/release-notes.md`, `submission/checklist.md`, `submission/listing.es.md`, `submission/openai-portal-handoff.md`
- Modify: `tests/distribution.test.mjs`, `tests/submission.test.mjs`

**Interfaces:**
- Version constants become `0.4.0` and every release link targets `v0.4.0`.
- `packaging/native-installer.json` declares Codex and Claude adapters, optional Agent Skills, unsigned fallback, and `video: "DEFERRED"`.

- [ ] Add failing assertions for version 0.4.0, no available video link, Claude adapter files, department catalog, and learning contract files.
- [ ] Run `npm test`; capture RED failures naming each missing contract.
- [ ] Update manifests, canonical copy, release notes, and handoff to 0.4.0 without claiming ChatGPT publication or signing.
- [ ] Run the focused tests and confirm GREEN.
- [ ] Commit: `test: define Nuvetio 0.4.0 market contract`.

### Task 2: Make platform installers dependency-tolerant

**Files:**
- Modify: `installers/macos/Instalar-Nuvetio.command`
- Modify: `installers/windows/Instalar-Nuvetio.ps1`, `installers/windows/Instalar-Nuvetio.cmd`
- Modify: `packaging/macos/postinstall`
- Create: `installers/macos/Instalar-Codex-CLI.command`
- Create: `installers/windows/Instalar-Codex-CLI.ps1`
- Create: `installers/windows/Instalar-Codex-CLI.cmd`
- Create: `installers/runtime-detection.json`
- Modify: `scripts/build-macos-installer.sh`, `scripts/build-windows-installer.ps1`
- Test: `tests/installer-runtime.test.mjs`

**Interfaces:**
- `detectRuntime(env, platform)` returns `{ codexCli, claudeCode, codexDesktop, packageRoot }` without executing commands.
- `installNuvetio({ runtime, packageRoot, consent })` always copies/verifies the payload and returns `{ installed, activated, nextStep }`.
- Optional Codex CLI installers require explicit `consent === true`, use pinned official artifacts, verify SHA-256, and never perform login.

- [ ] Write RED tests for Mac/Windows with no `codex`, with a fake `codex`, with `claude`, and with both runtimes; assert no fatal dependency error when `codex` is absent.
- [ ] Run `node --test tests/installer-runtime.test.mjs`; confirm failure against current hard-stop behavior.
- [ ] Implement detection and non-fatal activation; write a timestamped local log and a human-readable recovery message.
- [ ] Implement optional Codex CLI installation only behind explicit consent and pinned hash metadata; do not use `curl | sh`, `irm | iex`, or credentials.
- [ ] Add tests for malformed payload, failed activation, and successful activation with a fake runtime.
- [ ] Run focused tests and a noninteractive package smoke test on Windows; record that Mac `pkgbuild` remains CI-only on Windows hosts.
- [ ] Commit: `fix: make Nuvetio installation runtime tolerant`.

### Task 3: Add Claude Code adapter and cross-runtime onboarding

**Files:**
- Create: `adapters/claude/CLAUDE.md`
- Create: `adapters/claude/skills/nuvetio/SKILL.md`
- Create: `installers/macos/Instalar-Nuvetio-Claude.command`
- Create: `installers/windows/Instalar-Nuvetio-Claude.ps1`
- Create: `installers/windows/Instalar-Nuvetio-Claude.cmd`
- Modify: `packaging/native-installer.json`, `packaging/LEEME-PRIMERO.txt`, `README.md`, `docs/guia-rapida.html`, `docs/soporte.html`
- Test: `tests/claude-adapter.test.mjs`

**Interfaces:**
- `adapters/claude/CLAUDE.md` references the canonical Nuvetio skill and never overwrites existing instructions.
- Claude installer supports `--scope project|user`, creating `.claude/skills/nuvetio/` or `~/.claude/skills/nuvetio/` only after confirmation.

- [ ] Add RED tests for project/user scope, preserving existing `CLAUDE.md`, and rejecting missing canonical skill.
- [ ] Run the focused tests and verify RED.
- [ ] Implement a copy-only adapter with atomic temp directory replacement and backup of an existing Nuvetio adapter.
- [ ] Add fake `claude` smoke tests proving Nuvetio files are present without invoking authentication.
- [ ] Update guide/page copy to show parallel Codex and Claude paths with separate accounts.
- [ ] Run `npm test` and `npm run validate`; commit `feat: add Claude Code Nuvetio adapter`.

### Task 4: Bundle Agent Skills as an optional verified companion

**Files:**
- Create: `addons/agent-skills/manifest.json`
- Create: `addons/agent-skills/README.md`
- Create: `addons/agent-skills/installers/claude/`
- Modify: `addons/agent-skills.json`
- Modify: `installers/macos/Instalar-Agent-Skills.command`, `installers/windows/Instalar-Agent-Skills.ps1`, `installers/windows/Instalar-Agent-Skills.cmd`
- Modify: `docs/index.html`, `docs/guia-rapida.html`, `docs/soporte.html`, `packaging/LEEME-PRIMERO.txt`
- Test: `tests/agent-skills.test.mjs`

**Interfaces:**
- `addons/agent-skills/manifest.json` contains upstream URL, version, commit/hash, author, MIT license, and runtime adapters.
- `activateAgentSkills({ runtime, consent })` refuses activation without explicit consent and returns an auditable result.

- [ ] Add RED tests requiring bundled metadata, attribution, optional consent, Codex adapter, Claude adapter, and no auto-install on base Nuvetio path.
- [ ] Verify the upstream source and license; record the exact fetched revision without storing credentials.
- [ ] Vendor only the reviewed pack or provide a pinned, hash-verified companion archive; remove the current unpinned marketplace-only assumption.
- [ ] Implement runtime-specific activation and clear “Nuvetio works without this” messaging.
- [ ] Run focused tests and inspect package contents for secrets/remote scripts; commit `feat: bundle optional Agent Skills companion`.

### Task 5: Define and expose the complete department team

**Files:**
- Create: `departments/nuvetio-departments.json`
- Create: `plugins/nuvetio/skills/operate-nuvetio/references/departments.md`
- Modify: `plugins/nuvetio/skills/operate-nuvetio/SKILL.md`
- Modify: `docs/index.html`, `docs/styles.css`, `content/public-copy.es.json`
- Create: `docs/assets/nuvetio-departments.svg`
- Test: `tests/departments.test.mjs`

**Interfaces:**
- `departments/nuvetio-departments.json` contains ten departments, each with `id`, `label`, `status`, `agents`, `functions`, `inputs`, `outputs`, and `limits`.
- `renderDepartmentDiagram(departments)` is a static SVG contract: Orchestrator center, active layer, consultive layer, accessible labels.

- [ ] Add RED tests for all ten departments, agent names, Finance/Legal disclaimers, active/consultive status, and SVG accessibility.
- [ ] Run focused tests and confirm RED.
- [ ] Add the catalog and routing reference; update the orchestrator to select only relevant departments.
- [ ] Add the responsive SVG diagram and beginner-friendly explanatory copy; avoid claiming roadmap departments are already autonomous.
- [ ] Run static page validation and inspect desktop/mobile layout; commit `feat: add complete Nuvetio department map`.

### Task 6: Implement consent-first shared-learning foundation

**Files:**
- Create: `learning/schema.json`
- Create: `learning/consent.mjs`
- Create: `learning/redact.mjs`
- Create: `learning/feedback.mjs`
- Create: `learning/queue.mjs`
- Create: `learning/README.md`
- Modify: `plugins/nuvetio/skills/operate-nuvetio/SKILL.md`
- Modify: `docs/privacidad.html`, `docs/terminos.html`, `docs/soporte.html`, `README.md`
- Test: `tests/learning.test.mjs`

**Interfaces:**
- `getConsent(store)` returns `"unknown" | "granted" | "denied"`.
- `setConsent(store, value)` persists only the preference and timestamp.
- `redactFeedback(input)` returns `{ safeText, redactions, rejected }` and removes secrets, emails, phone numbers, paths, and direct identifiers.
- `enqueueFeedback({ consent, rating, text })` writes a local JSONL candidate only when consent is `granted`.

- [ ] Add RED tests for first-use consent, no-write on denial, reversible consent, redaction fixtures, and queue schema.
- [ ] Run focused tests and confirm RED.
- [ ] Implement local consent and feedback without network calls or full conversation capture.
- [ ] Add an export format for human review and a deletion command; document that no model is updated automatically.
- [ ] Add plain-text “¿Te fue útil?” guidance to the skill while explicitly stating that host-native buttons are unavailable.
- [ ] Run security-oriented tests for tokens, credentials, private paths, and sensitive terms; commit `feat: add consent-first learning queue`.

### Task 7: Prepare signing, ChatGPT submission, and market documentation

**Files:**
- Create: `.github/workflows/sign-installers.yml`
- Modify: `.github/workflows/build-installers.yml`
- Create: `packaging/signing/README.md`
- Modify: `submission/openai-portal-handoff.md`, `submission/listing.es.md`, `submission/checklist.md`, `submission/release-notes.md`
- Modify: `docs/index.html`, `docs/privacidad.html`, `docs/soporte.html`
- Test: `tests/release-readiness.test.mjs`

**Interfaces:**
- Signing workflow fails closed when required secrets/certificates are absent and labels unsigned artifacts explicitly.
- OpenAI handoff declares skills-only, Codex/ChatGPT compatibility, Agent Skills attribution, and `NOT SUBMITTED` until portal evidence exists.

- [ ] Add RED tests for signing metadata, no false “signed” copy, v0.4.0 release notes, video deferred copy, and ChatGPT pending status.
- [ ] Implement certificate-aware workflow placeholders that do not expose secrets or create fake signatures.
- [ ] Update market copy and PDF/HTML guide for Codex and Claude; remove obsolete CLI-only claims.
- [ ] Run tests and inspect release assets; commit `docs: prepare Nuvetio 0.4.0 market release`.

### Task 8: Full verification and gated publication

**Files:**
- Inspect: all changed files, release package, CI workflows, and generated docs.
- Create: `docs/superpowers/reports/2026-08-20-nuvetio-v040-release-report.md`

**Interfaces:**
- Report records commit, test counts, package hashes, runtime smoke outcomes, signing status, ChatGPT submission status, and deferred video status.

- [ ] Run `npm test`, `npm run validate`, `git diff --check`, and a secret/private-content scan.
- [ ] Run isolated fake Codex/Claude installer smokes for absent/present runtimes and verify no external actions.
- [ ] Run CI build and public-page checks; test Windows on a clean environment and Mac package on a macOS runner.
- [ ] If certificates are supplied, sign/notarize and verify signatures; otherwise label artifacts unsigned and stop that gate.
- [ ] Review the complete diff and release report; do not publish while a required gate is red.
- [ ] Present the local release candidate for final approval before pushing `main`, tag `v0.4.0`, or publishing the release.
