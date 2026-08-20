# Publish Nuvetio v0.4.0 Downloaders Implementation Plan

> **For agentic workers:** Execute the release steps in order and verify each external artifact before claiming completion.

**Goal:** Publish the existing Nuvetio 0.4.0 installers so the public Windows and Mac download buttons resolve successfully.

**Architecture:** Keep the already-published static HTML links targeting the versioned GitHub release. Create the annotated tag from the verified `main` commit, let the existing CI workflow build native installers on Windows and macOS, then upload those artifacts and SHA-256 files to a GitHub release.

**Tech Stack:** Git, GitHub Actions, GitHub Releases API, PowerShell, Node.js tests.

**Spec:** `docs/superpowers/specs/2026-08-20-nuvetio-v040-complete-design.md`

## Global Constraints

- Publish only the artifacts built by the repository's existing workflow.
- Keep installer signing status explicitly UNSIGNED.
- Do not alter the existing download URLs or expose the ZIP fallback.
- Verify `npm test`, `npm run validate`, release asset HTTP responses, and a clean worktree.

---

### Task 1: Baseline and release target

**Files:**
- Read: `docs/index.html`
- Read: `packaging/native-installer.json`
- Read: `.github/workflows/build-installers.yml`

- [x] Confirm the public links target `v0.4.0`.
- [x] Confirm the release tag is absent and reproduce the two installer URLs returning 404.
- [x] Confirm the local commit is clean and tests/validation pass.

### Task 2: Build native artifacts

**Files:**
- No source changes; use the existing CI workflow.

- [x] Create and push annotated tag `v0.4.0` at the verified `main` commit.
- [x] Wait for the tag-triggered workflow to complete successfully.
- [x] Download the Windows and macOS installer artifacts and their SHA-256 files.

### Task 3: Publish release assets

**Files:**
- Read: `submission/release-notes.md`

- [x] Create the public GitHub release `v0.4.0` with the canonical release notes.
- [x] Upload `Nuvetio-0.4.0-Setup.exe`, `Nuvetio-0.4.0-Setup.exe.sha256`, `Nuvetio-0.4.0.pkg`, and `Nuvetio-0.4.0.pkg.sha256`.
- [x] Preserve the unsigned-artifact disclosure from the release notes.

### Task 4: Verify download flow

- [x] Run `npm test`, `npm run validate`, and `git diff --check`.
- [x] Request both public installer URLs and require HTTP 302/200 with the expected filenames.
- [x] Request the guide URL and require HTTP 200 with `application/pdf`.
- [x] Verify GitHub Pages exposes the unchanged links and leave `main` clean and synchronized with `origin/main`.
