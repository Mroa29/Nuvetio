# Notas de la versión 0.5.0

Nuvetio 0.5.0, antes AI Team Core, incorpora instaladores tolerantes, compatibilidad con Codex y Claude Code, Agent Skills opcional, ocho departamentos consultivos, aprendizaje compartido con consentimiento y una base opcional de Worker/D1. El video de presentación queda pendiente.

## Incluye

- Orquestación de consultas en lenguaje natural, sin exigir conocimientos de prompting avanzado.
- Perspectivas de producto e inteligencia artificial para definir problemas, alcance, datos, riesgos y criterios de éxito.
- Diseño de experiencia, flujos, wireframes y mockups, con alternativa textual cuando no existe capacidad visual.
- Planificación de ingeniería e implementación mediante unidades pequeñas, interfaces y dependencias claras.
- Pruebas, calidad, seguridad, criterios de aceptación y revisión de riesgos.
- Onboarding en español con consultas iniciales orientadas a personas principiantes.
- Instaladores nativos para Windows y Mac que registran el marketplace local y activan Nuvetio en Codex CLI.
- La página principal muestra solo los instaladores nativos y la guía; el ZIP queda como respaldo técnico de la release.
- Los instaladores todavía no tienen firma digital y pueden mostrar una advertencia del sistema operativo.
- Companion opcional Agent Skills: 24 workflows upstream de Addy Osmani, licencia MIT, con confirmación antes de conectarse a GitHub.
- Mascota local de Nuvetio y diagrama responsive del Orquestador, Ingeniería, Producto e IA, Experiencia, Calidad y Seguridad, core operativo y roadmap.
- Marketing, Operaciones, Finanzas y Legal quedan disponibles como orientación consultiva con límites profesionales explícitos.
- El aprendizaje compartido acepta únicamente candidatos estructurados y redactados, requiere consentimiento separado, revisión humana y expira después de 90 días si no se aprueba.

## Infraestructura

Esta versión no requiere autenticación externa para usar las skills. El Worker Cloudflare/D1 es opcional, no está desplegado por defecto y nunca modifica automáticamente el modelo ni las skills.
