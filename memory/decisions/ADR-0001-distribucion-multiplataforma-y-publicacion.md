# ADR-0001: distribución multiplataforma y publicación controlada

- **Fecha:** 2026-08-19
- **Estado:** Accepted
- **Alcance:** Nuvetio 0.2.1 y versiones posteriores hasta nuevo ADR

## Contexto

La instalación basada únicamente en Terminal resultó difícil para usuarios principiantes, especialmente en Mac. Nuvetio también necesita una ruta clara para solicitar publicación en ChatGPT sin confundir una preparación local con una aprobación de OpenAI.

## Decisión

Nuvetio se distribuirá con launchers locales de doble clic para Mac (`.command`) y Windows (`.cmd` + PowerShell). Los launchers solo registran el marketplace local y activan `nuvetio@nuvetio`; no descargan scripts remotos, no piden permisos de administrador y no leen credenciales.

La publicación en ChatGPT se preparará mediante una ficha `skills-only` y un handoff al portal oficial. El estado debe permanecer `NOT SUBMITTED` hasta que una persona con permiso de Apps Management verifique su identidad y confirme antes de enviar o publicar.

## Alternativas consideradas

- Mantener únicamente comandos de Terminal: descartado porque aumenta la fricción para principiantes.
- Crear un instalador nativo firmado (`.pkg`/`.msi`): pospuesto hasta contar con firma, notarización y mantenimiento multiplataforma.
- Ejecutar un instalador remoto con `curl` o `irm`: descartado por seguridad y auditabilidad.

## Consecuencias

- La experiencia inicial pasa a ser descarga, descompresión, doble clic y nueva sesión de Codex CLI.
- Codex CLI sigue siendo un requisito; esta distribución no instala Codex ni cambia sus límites o costos.
- ChatGPT no debe anunciarse como instalación directa hasta la revisión y publicación oficial.

## Evidencia

- `installers/macos/Instalar-Nuvetio.command`
- `installers/windows/Instalar-Nuvetio.cmd`
- `installers/windows/Instalar-Nuvetio.ps1`
- `submission/openai-portal-handoff.md`
- Release pública: https://github.com/Mroa29/Nuvetio/releases/tag/v0.2.1
