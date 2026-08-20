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

if [ ! -f "$PACKAGE_ROOT/.agents/plugins/marketplace.json" ]; then
  fail 'el paquete está incompleto; vuelve a descargarlo desde la página oficial.'
fi

maybe_install_codex() {
  if [ "${NUVETIO_INSTALL_CODEX_CLI:-}" = "1" ] && command -v npm >/dev/null 2>&1; then
    printf '%s\n' 'Instalando Codex CLI desde el paquete oficial de npm…'
    npm install --global @openai/codex || printf '%s\n' 'No se pudo instalar Codex CLI automáticamente. Puedes usar Claude Code o instalarlo desde la guía oficial.' >&2
  fi
}

install_claude_adapter() {
  CLAUDE_HOME="${HOME}/.claude"
  mkdir -p "$CLAUDE_HOME/skills/nuvetio"
  cp "$PACKAGE_ROOT/adapters/claude/skills/nuvetio/SKILL.md" "$CLAUDE_HOME/skills/nuvetio/SKILL.md"
  if [ ! -f "$CLAUDE_HOME/CLAUDE.md" ]; then
    cp "$PACKAGE_ROOT/adapters/claude/CLAUDE.md" "$CLAUDE_HOME/CLAUDE.md"
  fi
}

CODEX="$(command -v codex 2>/dev/null || true)"
if [ -z "$CODEX" ] && [ "${NUVETIO_INSTALL_NONINTERACTIVE:-}" != "1" ]; then
  printf '%s' 'No encontramos Codex CLI. ¿Quieres instalarlo desde npm ahora? [s/N] '
  read ANSWER || ANSWER=''
  case "$ANSWER" in
    s|S|sí|Sí|SI|si) NUVETIO_INSTALL_CODEX_CLI=1; export NUVETIO_INSTALL_CODEX_CLI; maybe_install_codex ;;
  esac
  CODEX="$(command -v codex 2>/dev/null || true)"
fi

if [ -n "$CODEX" ]; then
  "$CODEX" plugin marketplace add "$PACKAGE_ROOT" || fail 'Codex no pudo registrar el marketplace local.'
  "$CODEX" plugin add 'nuvetio@nuvetio' || fail 'Codex no pudo activar el plugin.'
  printf '%s\n' 'Nuvetio quedó instalado en Codex.' 'Abre una sesión nueva de Codex para comenzar.'
elif command -v claude >/dev/null 2>&1; then
  install_claude_adapter
  printf '%s\n' 'Nuvetio quedó copiado correctamente.' 'Detectamos Claude Code; consulta la guía para activar el adaptador de Nuvetio.'
  printf '%s\n' 'Codex CLI es opcional y no es necesario para continuar.'
else
  printf '%s\n' 'Nuvetio quedó copiado correctamente, pero todavía no hay un runtime compatible activado.'
  printf '%s\n' 'Puedes abrir Codex Desktop, instalar Codex CLI desde la guía oficial o instalar Claude Code.'
  printf '%s\n' 'Vuelve a ejecutar este instalador cuando quieras activar Nuvetio en el runtime elegido.'
fi

finish
