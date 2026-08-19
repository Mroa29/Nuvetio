#!/bin/sh

set -eu

PACKAGE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)

finish() {
  if [ "${NUVETIO_INSTALL_NONINTERACTIVE:-}" != "1" ]; then
    printf '%s\n' 'Presiona Enter para cerrar esta ventana.'
    read _ || true
  fi
}

fail() {
  printf 'No se pudo instalar Nuvetio: %s\n' "$1" >&2
  finish
  exit 1
}

if ! command -v codex >/dev/null 2>&1; then
  fail 'no encontramos Codex CLI. Instálalo y vuelve a ejecutar este archivo.'
fi

if [ ! -f "$PACKAGE_ROOT/.agents/plugins/marketplace.json" ]; then
  fail 'el paquete está incompleto; vuelve a descargarlo desde la página oficial.'
fi

codex plugin marketplace add "$PACKAGE_ROOT" || fail 'Codex no pudo registrar el marketplace local.'
codex plugin add 'nuvetio@nuvetio' || fail 'Codex no pudo activar el plugin.'

printf '%s\n' 'Nuvetio quedó instalado en Codex.' 'Abre una sesión nueva de Codex para comenzar.'
finish
