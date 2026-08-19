# Agent Skills and Nuvetio Team Visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the optional Agent Skills companion to Nuvetio and present the complete active team architecture with a friendly Nuvetio mascot on the public site.

**Architecture:** Keep Nuvetio's own skills in its existing skills-only plugin. Add Agent Skills as an explicitly confirmed upstream companion with metadata and platform launchers, without vendoring its 24 skills. Add a local SVG mascot and an accessible responsive team map to the homepage, distinguishing active departments, core systems, optional Agent Skills, and future roadmap departments.

**Tech Stack:** JSON metadata, POSIX shell, Windows CMD/PowerShell, semantic HTML/CSS, local SVG, Node.js `node:test`, existing distribution validator, Edge PDF export, browser QA.

**Spec:** `docs/superpowers/specs/2026-08-19-agent-skills-companion-design.md` plus the approved team-map and mascot design in the conversation.

## Global Constraints

- Keep Nuvetio's base installation independent from Agent Skills.
- Agent Skills installation must require explicit user confirmation before network access.
- Do not use remote shell pipes, credentials, elevation, or hidden telemetry.
- Attribute Addy Osmani, the upstream repository, MIT license, and reference version `0.6.7`.
- Do not present future Marketing, Operations, Finance, or Legal departments as active capabilities.
- Use a local mascot asset; no remote image or tracking dependency.
- Maintain accessible labels, responsive layout, and no horizontal overflow at phone widths.
- Bump the public distribution to `0.2.2` without moving existing tags.

### Task 1: Add tested Agent Skills companion metadata and launchers

**Files:**
- Create: `addons/agent-skills.json`
- Create: `installers/macos/Instalar-Agent-Skills.command`
- Create: `installers/windows/Instalar-Agent-Skills.ps1`
- Create: `installers/windows/Instalar-Agent-Skills.cmd`
- Test: `tests/distribution.test.mjs`

**Interfaces:**
- Metadata exposes `name`, `upstream`, `version`, `author`, `license`, `marketplaceCommand`, and `pluginCommand`.
- Each launcher consumes an installed Codex CLI and asks for explicit confirmation before running the two upstream commands.
- A declined confirmation exits successfully without contacting the upstream marketplace.

- [ ] Write failing tests for metadata, explicit confirmation, commands, and unsafe execution patterns.
- [ ] Run the focused tests and observe failure because the companion files do not exist.
- [ ] Implement minimal metadata and launchers with readable errors and non-interactive test mode.
- [ ] Run focused tests and an isolated fake-Codex smoke test for Windows and Mac shell flows.

### Task 2: Add mascot and complete team architecture section

**Files:**
- Create: `docs/assets/mascot-nuvetio.svg`
- Modify: `docs/index.html`
- Modify: `docs/styles.css`
- Modify: `content/public-copy.es.json`
- Modify: `tests/distribution.test.mjs`

**Interfaces:**
- Homepage presents the active orchestrator, Engineering, Product & IA, Experience & Mockups, and Quality & Security departments.
- Homepage distinguishes core systems, optional Agent Skills, and future roadmap departments.
- The mascot replaces the brand logo and has accessible alternative text.

- [ ] Write failing assertions for mascot reference, department labels/functions, optional companion disclosure, and future roadmap disclosure.
- [ ] Run the focused homepage test and observe failure.
- [ ] Add the local SVG mascot and responsive semantic team-map markup/styles.
- [ ] Run focused tests and inspect desktop/mobile rendering, focus order, contrast, console, and overflow.

### Task 3: Update onboarding, package, and submission copy

**Files:**
- Modify: `README.md`
- Modify: `docs/guia-rapida.html`
- Modify: `docs/soporte.html`
- Modify: `submission/listing.es.md`
- Modify: `submission/release-notes.md`
- Modify: `submission/openai-portal-handoff.md`
- Modify: `package.json`, `plugins/nuvetio/.codex-plugin/plugin.json`, `scripts/validate-distribution.mjs`
- Modify: `tests/submission.test.mjs`, `tests/distribution.test.mjs`

**Interfaces:**
- Public instructions explain base installation first and optional Agent Skills second in beginner language.
- OpenAI handoff remains `NOT SUBMITTED` and describes Agent Skills as an upstream optional companion, not Nuvetio-owned infrastructure.

- [ ] Add failing documentation/version assertions for `0.2.2`, companion metadata, and no false ChatGPT approval.
- [ ] Update canonical copy, guides, README, listing, release notes, and version gates.
- [ ] Rebuild the generic `Nuvetio-0.2.2.zip` with launchers, metadata, skills, and PDF.
- [ ] Run `npm test`, `npm run validate`, and ZIP entry/hash checks.

### Task 4: Final verification and public release

**Files:**
- No further source changes beyond Tasks 1–3.

- [ ] Run `npm test`, `npm run validate`, and `git diff --check`.
- [ ] Run browser QA on the public page at desktop and phone widths using the web-app testing workflow.
- [ ] Review diff for secrets, duplicated upstream skills, misleading claims, missing attribution, and broken local references.
- [ ] Commit with Marcos Roa author/committer, push `main`, create annotated `v0.2.2`, publish release assets, and verify HTTP 200 endpoints.
