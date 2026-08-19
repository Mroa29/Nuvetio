# Native Nuvetio Installers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish Nuvetio 0.3.0 with native-looking Windows and Mac installers as the primary downloads, while keeping the ZIP hidden as a technical fallback and documenting the future OpenAI distribution path.

**Architecture:** Keep the existing portable payload as the source of truth. Build a Windows self-extracting `.exe` with IExpress that runs the validated local PowerShell installer, and build a Mac `.pkg` in a macOS GitHub Actions runner with `pkgbuild` and a local postinstall script. Update the public page to link only those installers and the guide; preserve the ZIP only as a release asset.

**Tech Stack:** Node.js `node:test`, PowerShell, Windows IExpress, POSIX shell, macOS `pkgbuild`, GitHub Actions, static HTML/CSS.

**Spec:** `docs/superpowers/specs/2026-08-19-native-installers-design.md`

## Global Constraints

- Version the native-installer release as `0.3.0` / `v0.3.0`.
- Do not add remote shell pipes, telemetry, MCP, backend, accounts, or shared learning.
- Do not auto-install Agent Skills; its explicit `SI` confirmation remains separate.
- The public page must not link to `.zip`; the release may retain it as a fallback asset.
- Windows installer must not force elevation; Mac package behavior must disclose any system installer authorization prompt.
- Preserve author/committer `Marcos_Roa <marcos.roa.ocampos@gmail.com>`.

---

### Task 1: Add failing tests for native distribution

**Files:**
- Modify: `tests/distribution.test.mjs`
- Modify: `tests/submission.test.mjs`

**Interfaces:**
- Tests will require `scripts/build-windows-installer.ps1`, `scripts/build-macos-installer.sh`, `.github/workflows/build-installers.yml`, and installer metadata.
- Tests will require `docs/index.html` to contain Windows/Mac installer links and no visible ZIP download link.

- [ ] **Step 1: Write the failing tests**

  Add assertions for version `0.3.0`, native artifact names, build scripts, workflow runners, explicit local payload paths, no remote shell pipes/elevation, and the public page's absence of `.zip` links.

- [ ] **Step 2: Run the focused tests and confirm RED**

  Run `npm test -- --test-name-pattern "native|installer|versioned Nuvetio ZIP"`.
  Expected: failures because the native build scripts, workflow, metadata, and links do not exist yet.

### Task 2: Implement reproducible native builds

**Files:**
- Create: `packaging/native-installer.json`
- Create: `scripts/build-windows-installer.ps1`
- Create: `scripts/build-macos-installer.sh`
- Create: `packaging/macos/postinstall`
- Create: `.github/workflows/build-installers.yml`
- Modify: `scripts/validate-distribution.mjs`

**Interfaces:**
- `build-windows-installer.ps1 -Version 0.3.0 -OutputDirectory <dir>` produces `Nuvetio-0.3.0-Setup.exe` using IExpress.
- `build-macos-installer.sh 0.3.0 <output-directory>` produces `Nuvetio-0.3.0.pkg` on macOS.
- The workflow runs tests/validation, builds both artifacts, uploads them, and exposes hashes for release handoff.

- [ ] **Step 1: Implement the smallest Windows IExpress builder**

  Stage only `.agents`, `plugins`, `installers`, `addons`, `packaging/LEEME-PRIMERO.txt`, and the PDF. Generate an IExpress SED with a local `install.cmd` entrypoint that invokes `installers/windows/Instalar-Nuvetio.ps1`; fail if `iexpress.exe` or a required payload file is missing.

- [ ] **Step 2: Implement the smallest Mac package builder**

  Stage the same payload under a deterministic package root, run `pkgbuild`, and include `packaging/macos/postinstall`. The postinstall script must locate the active console user, check `codex`, register the local marketplace, activate `nuvetio@nuvetio`, and show an actionable success/error message without downloading code.

- [ ] **Step 3: Add CI build workflow**

  Use `windows-latest` for IExpress and `macos-latest` for `pkgbuild`, run `npm test` and `npm run validate`, upload `.exe`, `.pkg`, and SHA-256 files, and avoid publishing a release automatically.

- [ ] **Step 4: Run tests and validation**

  Run `npm test` and `npm run validate`; expected result is GREEN with the new files covered by required-file checks.

### Task 3: Update public distribution and OpenAI handoff

**Files:**
- Modify: `package.json`
- Modify: `plugins/nuvetio/.codex-plugin/plugin.json`
- Modify: `content/public-copy.es.json`
- Modify: `docs/index.html`
- Modify: `docs/guia-rapida.html`
- Modify: `docs/soporte.html`
- Modify: `README.md`
- Modify: `submission/checklist.md`
- Modify: `submission/listing.es.md`
- Modify: `submission/release-notes.md`
- Modify: `submission/openai-portal-handoff.md`
- Modify: `tests/submission.test.mjs`

**Interfaces:**
- Public buttons: Windows installer, Mac installer, and guide.
- ZIP remains absent from homepage HTML but remains documented as a support fallback in the release notes.
- OpenAI handoff remains clearly `NOT SUBMITTED` until official directory approval exists.

- [ ] **Step 1: Bump package and public copy to 0.3.0**
- [ ] **Step 2: Replace the homepage ZIP CTA with native installer CTAs**
- [ ] **Step 3: Update beginner instructions and warning about unsigned installers**
- [ ] **Step 4: Update release/submission docs and OpenAI roadmap wording**
- [ ] **Step 5: Run all tests and inspect the diff**

### Task 4: Build, verify, and publish

**Files:**
- Create outside repository: a versioned `Nuvetio-0.3.0` delivery folder and ZIP.

- [ ] **Step 1: Build Windows artifact locally with IExpress**
- [ ] **Step 2: Run an isolated Windows smoke test with a fake Codex and temporary `CODEX_HOME`**
- [ ] **Step 3: Trigger CI and verify Mac package artifact**
- [ ] **Step 4: Run HTTP checks for page, installer links, guide, and hidden ZIP**
- [ ] **Step 5: Push `main`, create annotated tag `v0.3.0`, and publish release assets**
- [ ] **Step 6: Verify release hashes, remote commit, clean worktree, tests, and validation**
