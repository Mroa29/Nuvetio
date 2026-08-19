#!/bin/sh

set -eu

finish() {
  if [ "${NUVETIO_INSTALL_NONINTERACTIVE:-}" != "1" ]; then
    printf '%s\n' 'Presiona Enter para cerrar esta ventana.'
    read _ || true
  fi
}

fail() {
  printf 'No se pudo instalar Agent Skills: %s\n' "$1" >&2
  finish
  exit 1
}

if ! command -v codex >/dev/null 2>&1; then
  fail 'no encontramos Codex CLI. Instálalo y vuelve a ejecutar este archivo.'
fi

if [ "${NUVETIO_INSTALL_NONINTERACTIVE:-}" = "1" ]; then
  answer='SI'
else
  printf '%s\n' 'Agent Skills es un complemento opcional de Nuvetio.' 'Se conectará al repositorio público de Addy Osmani (licencia MIT) para instalar 24 skills.'
  printf '¿Quieres instalarlo? Escribe SI para continuar: '
  IFS= read answer || answer='NO'
fi

case "$answer" in
  SI|si|Sí|sí|S|s) ;;
  *) printf '%s\n' 'No se instaló Agent Skills. Nuvetio seguirá funcionando normalmente.'; finish; exit 0 ;;
esac

codex plugin marketplace add 'https://github.com/addyosmani/agent-skills.git' || fail 'Codex no pudo registrar el marketplace upstream.'
codex plugin add 'agent-skills@agent-skills' || fail 'Codex no pudo activar el complemento.'

printf '%s\n' 'Agent Skills quedó instalado como complemento de Nuvetio.' 'Abre una sesión nueva de Codex para usar sus workflows.'
finish
