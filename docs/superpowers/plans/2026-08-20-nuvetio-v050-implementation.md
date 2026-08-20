# Nuvetio v0.5 Shared Learning and Departments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement consented anonymized learning infrastructure, activate the four consultive roadmap departments, and prepare the official skills-only ChatGPT submission without claiming publication.

**Architecture:** Keep redaction and consent decisions in the local runtime. Add a dependency-free Cloudflare Worker/D1 reference implementation that accepts only structured redacted candidates, expires unreviewed records after 90 days, and protects review actions with a configured secret. Route the four new departments through Nuvetio's existing skill with explicit professional limits; keep OpenAI handoff artifacts prepared and `NOT SUBMITTED`.

**Tech Stack:** Node.js 20, node:test, ECMAScript modules, Cloudflare Workers Fetch API, D1 SQL, Wrangler configuration example, static Markdown/JSON/HTML.

**Spec:** `docs/superpowers/specs/2026-08-20-nuvetio-v050-shared-learning-departments-chatgpt-design.md`

## Global Constraints

- Both local learning and shared contribution require explicit consent and start disabled.
- Never store full conversations, personal data, secrets, IP addresses, user-agent values, or persistent person identifiers.
- Never modify a model or skill automatically; only versioned, reviewed changes may ship.
- Marketing, Operations, Finance and Legal remain consultive and cannot execute external actions or replace accredited professionals.
- Keep the official OpenAI handoff `NOT SUBMITTED`; no portal submission or identity verification is automated.
- Preserve the existing v0.4.0 public release until a separately reviewed v0.5.0 release is prepared.

---

### Task 1: Activate consultive department routing

**Files:**
- Modify: `departments/nuvetio-departments.json`
- Modify: `plugins/nuvetio/skills/operate-nuvetio/SKILL.md`
- Create: `plugins/nuvetio/skills/operate-nuvetio/references/marketing.md`
- Create: `plugins/nuvetio/skills/operate-nuvetio/references/operations.md`
- Create: `plugins/nuvetio/skills/operate-nuvetio/references/finance.md`
- Create: `plugins/nuvetio/skills/operate-nuvetio/references/legal.md`
- Test: `tests/department-routing.test.mjs`

- [ ] Write a failing test asserting all four departments have `active-consultive` status, references, routing triggers, outputs, and professional limits.
- [ ] Run `node --test tests/department-routing.test.mjs` and confirm it fails because the catalog and references are not yet active.
- [ ] Change only the four roadmap statuses, add their reference files, and document routing and limits in the existing skill.
- [ ] Run the focused test and then `npm test`.
- [ ] Commit `feat: activate consultive department routing`.

### Task 2: Add separate local and shared consent

**Files:**
- Modify: `learning/consent.mjs`
- Modify: `tests/learning.test.mjs`
- Create: `tests/learning-consent.test.mjs`

- [ ] Write a failing test for independent local/shared consent keys, disabled-by-default state, one-time persistence, and revocation.
- [ ] Run `node --test tests/learning-consent.test.mjs` and confirm the shared consent API is missing.
- [ ] Add `getSharedConsent` and `setSharedConsent` without changing the existing local consent API.
- [ ] Run focused consent tests and `npm test`.
- [ ] Commit `feat: separate shared learning consent`.

### Task 3: Structure expiring shared candidates

**Files:**
- Modify: `learning/feedback.mjs`
- Modify: `learning/queue.mjs`
- Modify: `learning/schema.json`
- Modify: `learning/README.md`
- Create: `learning/shared-client.mjs`
- Modify: `tests/learning.test.mjs`
- Create: `tests/shared-learning.test.mjs`

- [ ] Write failing tests for a candidate requiring shared consent, containing only redacted fields, a UUID, `pending_review` status, a 90-day expiry, and no model-update field.
- [ ] Run `node --test tests/shared-learning.test.mjs` and confirm the new candidate fields and transport client are missing.
- [ ] Extend feedback creation to accept shared consent and produce schema version `0.5.0`; preserve local-only behavior when shared consent is denied.
- [ ] Add a dependency-free `submitCandidate` client that sends only a validated candidate to a configured Worker URL and returns a structured result without retrying or logging content.
- [ ] Update the JSON schema and learning documentation with consent, expiry, deletion, and no-auto-training guarantees.
- [ ] Run focused tests and `npm test`.
- [ ] Commit `feat: structure expiring shared learning candidates`.

### Task 4: Implement the Cloudflare Worker and D1 schema

**Files:**
- Create: `learning/worker/src/handler.mjs`
- Create: `learning/worker/src/index.mjs`
- Create: `learning/worker/migrations/0001_learning.sql`
- Create: `learning/worker/wrangler.toml.example`
- Create: `learning/worker/README.md`
- Create: `tests/learning-worker.test.mjs`

- [ ] Write failing tests for `GET /v1/health`, valid candidate insertion, invalid payload rejection, oversized payload rejection, duplicate IDs, unauthorized review, authorized review, deletion request, and scheduled expiry cleanup.
- [ ] Run `node --test tests/learning-worker.test.mjs` and confirm the Worker handler does not exist.
- [ ] Implement pure validation and routing in `handler.mjs`, a Fetch/scheduled adapter in `index.mjs`, and the D1 migration for candidates and review events.
- [ ] Require a configured `NUVETIO_REVIEW_TOKEN` for review actions; never include a token in the repository or client bundle.
- [ ] Add `wrangler.toml.example` and deployment instructions requiring the user to create their own D1 database and secret.
- [ ] Run focused Worker tests and `npm test`.
- [ ] Commit `feat: add consented learning Worker and D1 schema`.

### Task 5: Prepare the ChatGPT skills-only submission

**Files:**
- Modify: `submission/openai-portal-handoff.md`
- Modify: `submission/checklist.md`
- Modify: `submission/listing.es.md`
- Create: `submission/v050-submission-notes.md`
- Test: `tests/submission-v050.test.mjs`

- [ ] Write a failing test asserting the v0.5 handoff identifies the optional Worker, the four consultive departments, Agent Skills attribution, required portal steps, and `NOT SUBMITTED`.
- [ ] Run `node --test tests/submission-v050.test.mjs` and confirm the v0.5 notes do not exist.
- [ ] Add the human handoff and review checklist without adding credentials or changing the official status.
- [ ] Keep the public listing honest: local Codex/Claude use is available; direct ChatGPT availability remains pending official review.
- [ ] Run focused submission tests and `npm test`.
- [ ] Commit `docs: prepare v0.5 ChatGPT submission handoff`.

### Task 6: Update privacy and user-facing learning disclosure

**Files:**
- Modify: `docs/privacidad.html`
- Modify: `README.md`
- Modify: `learning/README.md`
- Test: `tests/privacy-learning.test.mjs`

- [ ] Write a failing test requiring the public privacy copy to explain both consents, 90-day retention, deletion, review, and no automatic model updates.
- [ ] Run `node --test tests/privacy-learning.test.mjs` and confirm the new disclosure is absent.
- [ ] Update the copy without promising anonymity perfection or automatic learning.
- [ ] Run focused tests, `npm test`, `npm run validate`, and `git diff --check`.
- [ ] Commit `docs: disclose shared learning controls`.

### Task 7: Final verification and release handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-08-20-nuvetio-v050-shared-learning-departments-chatgpt-design.md`
- Create: `docs/superpowers/reports/2026-08-20-nuvetio-v050-implementation-report.md`

- [ ] Run the complete test suite, validator, and Worker focused tests.
- [ ] Verify the public package contains no secrets, no MCP configuration, and no false ChatGPT publication claim.
- [ ] Verify the Cloudflare example contains no real account IDs or tokens.
- [ ] Record what is implemented locally, what requires Cloudflare account setup, and what requires human OpenAI portal action.
- [ ] Commit `docs: record v0.5 implementation evidence`.
- [ ] Present the clean diff and ask before merging, pushing, or creating a v0.5.0 release.

