# Nuvetio

**Pregunta como siempre. Construye como un equipo profesional.**

**Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.**

Nuvetio convierte tus ideas y consultas en procesos claros de producto, diseño, inteligencia artificial e ingeniería. Tú explicas lo que necesitas con tus propias palabras; sus agentes te ayudan a analizarlo, mejorarlo y llevarlo a resultados concretos.

Sitio público: <https://mroa29.github.io/Nuvetio/>

## Para usuarios

1. Descarga el instalador para Windows (`Nuvetio-0.5.0-Setup.exe`) o Mac (`Nuvetio-0.5.0.pkg`) desde la release.
2. Ábrelo y sigue `Siguiente`, `Instalar` y `Finalizar`. Puede aparecer una advertencia porque el instalador todavía no está firmado.
3. Abre una sesión nueva de Codex, Codex Desktop o Claude Code y escribe tu consulta normalmente. Si no tienes Codex CLI, el instalador no falla: puedes elegir Claude Code o instalarlo después.

Nuvetio ofrece adaptadores para Codex CLI/Desktop y Claude Code. Agent Skills se activa aparte y solo después de tu confirmación. El aprendizaje local y el aporte compartido anonimizado tienen consentimientos independientes; los candidatos vencen a los 90 días y no modifican modelos automáticamente. La publicación directa en ChatGPT queda pendiente de revisión oficial. El video de presentación queda pendiente para una versión posterior.

## Para colaboradores

El repositorio contiene el manifiesto público, las skills estáticas, los adaptadores Codex/Claude, el complemento opcional Agent Skills, los instaladores nativos, el catálogo de departamentos, la base local de aprendizaje consentido, el Worker/D1 opcional, el sitio de documentación y las comprobaciones de distribución de Nuvetio. La versión 0.5.0 no habilita telemetría, conectores ni MCP.

```powershell
npm test
npm run validate
```

Publicado por Marcos Roa.
