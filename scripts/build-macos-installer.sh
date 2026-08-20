#!/bin/bash

set -eu

VERSION="${1:-0.5.0}"
OUTPUT_DIRECTORY="${2:-dist/native}"
SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPOSITORY_ROOT="$(CDPATH= cd -- "$SCRIPT_DIRECTORY/.." && pwd)"
OUTPUT_DIRECTORY="$(mkdir -p "$OUTPUT_DIRECTORY" && CDPATH= cd -- "$OUTPUT_DIRECTORY" && pwd)"

command -v pkgbuild >/dev/null 2>&1 || { echo "pkgbuild no está disponible; ejecuta este script en macOS." >&2; exit 1; }

WORK_DIRECTORY="$(mktemp -d "${TMPDIR:-/tmp}/nuvetio-pkg.XXXXXX")"
PAYLOAD="$WORK_DIRECTORY/payload"
trap 'rm -rf "$WORK_DIRECTORY"' EXIT
mkdir -p "$PAYLOAD/Users/Shared/Nuvetio"

for relative in .agents plugins installers addons adapters departments learning packaging/LEEME-PRIMERO.txt docs/downloads/guia-rapida-nuvetio.pdf; do
  source="$REPOSITORY_ROOT/$relative"
  [ -e "$source" ] || { echo "Falta el payload requerido: $relative" >&2; exit 1; }
  destination="$PAYLOAD/Users/Shared/Nuvetio/$relative"
  mkdir -p "$(dirname "$destination")"
  cp -R "$source" "$destination"
done

chmod 755 "$REPOSITORY_ROOT/packaging/macos/postinstall"
OUTPUT="$OUTPUT_DIRECTORY/Nuvetio-$VERSION.pkg"
pkgbuild \
  --root "$PAYLOAD" \
  --scripts "$REPOSITORY_ROOT/packaging/macos" \
  --identifier com.nuvetio.installer \
  --version "$VERSION" \
  --install-location / \
  "$OUTPUT"

shasum -a 256 "$OUTPUT" | awk '{print $1}' > "$OUTPUT.sha256"
printf '%s\n' "$OUTPUT"
