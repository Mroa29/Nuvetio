# Nuvetio multiplatform install design

## Goal

Reduce first-time setup for non-technical users on macOS and Windows to a download, a double-click, and a short confirmation, while preserving the current user-level Codex plugin installation model.

## Scope

- Add a macOS `.command` launcher and a Windows `.cmd` launcher with a PowerShell implementation.
- Reuse the existing local marketplace and `nuvetio@nuvetio` plugin commands.
- Keep installation user-scoped; do not request administrator privileges, read credentials, or download code at runtime.
- Update the public instructions and submission checklist to distinguish the immediate Codex path from the future ChatGPT directory path.

## Out of scope

- Code signing/notarization certificates and native `.pkg`/`.msi` packaging.
- Automatic installation of Codex CLI itself.
- Automatic submission or publication to OpenAI. The OpenAI portal requires an organization with submission access and verified developer or business identity.

## User flow

1. Download and unzip Nuvetio.
2. macOS: double-click `installers/macos/Instalar-Nuvetio.command`.
3. Windows: double-click `installers/windows/Instalar-Nuvetio.cmd`.
4. The launcher verifies that `codex` is installed, registers the bundled local marketplace, installs `nuvetio@nuvetio`, and explains the next session step.

## Safety and failure behavior

- If Codex is missing, stop with a human-readable message and the official installation URL.
- If a command fails, preserve its exit code and print the command that needs attention.
- Never use `curl | sh`, `irm | iex`, remote scripts, elevated permissions, telemetry, or credential access.

## Verification

- Unit tests assert the launchers contain the expected commands and safety constraints.
- `npm test`, `npm run validate`, and `git diff --check` must pass.
- A smoke run uses an isolated `CODEX_HOME` and the bundled package to verify marketplace/plugin installation.
- The public page must expose platform-specific steps and clearly state that ChatGPT installation remains pending directory publication.
