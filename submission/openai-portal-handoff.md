# Handoff para el portal oficial de OpenAI

**Estado:** `NOT SUBMITTED`
**Versión preparada:** Nuvetio 0.4.0
**Tipo:** `skills-only` (sin MCP, conectores, backend ni autenticación externa)

La preparación v0.5 añade un Worker Cloudflare + D1 opcional para aprendizaje
compartido anonimizado. No es necesario para usar las skills y no debe incluirse
como requisito obligatorio del envío. Consulta `v050-submission-notes.md` para
la evidencia y los límites actualizados.

## Portal

Abrir el portal oficial de gestión de aplicaciones: <https://platform.openai.com/apps-manage>.

La persona que envíe el plugin debe tener permiso de escritura en **Apps Management** y completar la verificación de identidad de desarrollador o empresa que solicite OpenAI. Esos requisitos dependen de la cuenta y no se pueden completar desde este repositorio.

## Datos para copiar

- **Nombre:** Nuvetio
- **Publicador:** Marcos Roa
- **Categoría:** Developer Tools
- **Tipo:** Skills-only
- **Sitio:** <https://mroa29.github.io/Nuvetio/>
- **Soporte:** <https://mroa29.github.io/Nuvetio/soporte.html>
- **Privacidad:** <https://mroa29.github.io/Nuvetio/privacidad.html>
- **Términos:** <https://mroa29.github.io/Nuvetio/terminos.html>
- **Bundle y código público:** <https://github.com/Mroa29/Nuvetio/tree/main/plugins/nuvetio>

Usar la descripción corta y larga de `listing.es.md`, los tres starter prompts de `starter-prompts.es.json` y los casos de `test-cases.json`. La release de referencia será <https://github.com/Mroa29/Nuvetio/releases/tag/v0.4.0> una vez publicada.

Agent Skills se declara como complemento upstream opcional, no como infraestructura propia de Nuvetio: <https://github.com/addyosmani/agent-skills>. Su autoría y licencia MIT deben mantenerse visibles. El paquete incluye adaptadores para Codex y Claude Code.

## Secuencia humana

1. Iniciar sesión en el portal con la cuenta que tenga Apps Management.
2. Completar o confirmar la identidad verificada y los datos del publicador.
3. Crear el envío como skills-only y pegar los datos de esta carpeta.
4. Ejecutar los casos positivos y negativos; adjuntar resultados si el portal los solicita.
5. Revisar privacidad, términos, disponibilidad regional y declaraciones de políticas.
6. Detenerse antes de **Submit for Review** y pedir confirmación explícita del propietario.
7. Después de una eventual aprobación, detenerse otra vez antes de publicar; la aprobación no debe inferirse del envío.

No se incluyen credenciales, tokens ni datos de usuarios en este documento. Hasta que OpenAI publique el plugin, Nuvetio debe seguir describiéndose como disponible mediante instalación local en Codex o Claude Code; no debe prometer instalación directa en ChatGPT.
