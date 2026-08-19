# Integración del complemento Agent Skills en Nuvetio

## Estado

Propuesta aprobada en conversación para especificación; pendiente de revisión del documento antes de implementar.

## Objetivo

Hacer que el pack oficial **Agent Skills** de Addy Osmani forme parte de la distribución y experiencia de Nuvetio como un complemento opcional, sin copiar sus 24 skills dentro del plugin principal ni ocultar que proviene de un repositorio externo.

## Contexto verificado

- Repositorio oficial: `https://github.com/addyosmani/agent-skills`.
- El repositorio declara 24 skills: 23 workflows de ciclo de vida y `using-agent-skills`.
- El manifiesto upstream observado declara versión `0.6.7`, autor Addy Osmani y licencia MIT.
- El upstream documenta para Codex CLI la instalación mediante:
  `codex plugin marketplace add addyosmani/agent-skills`
  y `codex plugin add agent-skills@agent-skills`.
- Agent Skills y Nuvetio cubren áreas relacionadas, por lo que una copia vendorizada podría duplicar nombres, instrucciones y versiones.

## Decisión de diseño

Nuvetio distribuirá una integración companion visible y opcional:

1. El ZIP de Nuvetio incluirá metadata de Agent Skills, atribución, licencia, enlace upstream y la versión de referencia verificada.
2. El ZIP incluirá un instalador separado de Agent Skills para Mac y Windows.
3. El instalador base de Nuvetio no instalará Agent Skills automáticamente.
4. Al ejecutar el instalador opcional, Codex CLI registrará el marketplace upstream y activará `agent-skills@agent-skills`.
5. El orquestador de Nuvetio seguirá siendo la entrada principal; Agent Skills se usará cuando el usuario lo pida explícitamente o cuando Codex lo seleccione por nombre.
6. La distribución mantendrá separadas las responsabilidades: Nuvetio controla su plugin y Agent Skills conserva su ciclo de versiones y autoría.

Esto hace que el complemento sea parte de Nuvetio para el usuario, pero no una copia silenciosa ni una dependencia inseparable para la instalación básica.

## Flujo de usuario

1. El usuario descarga el ZIP de Nuvetio.
2. Instala Nuvetio con el launcher base de su sistema operativo.
3. Si desea el equipo ampliado, abre `Complementos/Agent Skills` y ejecuta el launcher opcional correspondiente.
4. El launcher muestra que se conectará al repositorio público de Addy Osmani y requiere una confirmación explícita.
5. Codex CLI realiza la instalación del marketplace y del plugin; si falla, el launcher devuelve un mensaje legible y código distinto de cero.
6. El usuario inicia una sesión nueva y puede invocar una skill por nombre, por ejemplo `@spec-driven-development`.

## Seguridad y límites

- No usar `curl | sh`, `irm | iex`, scripts descargados ni elevación de privilegios.
- No leer, pedir ni guardar credenciales.
- La conexión de red ocurre solamente después de que el usuario ejecuta el complemento opcional y la realiza Codex CLI contra el repositorio público.
- Mostrar el repositorio, autor, licencia MIT y versión de referencia antes de la confirmación.
- No prometer que una actualización upstream mantiene el mismo comportamiento; la versión de referencia se documenta para trazabilidad, no como lockfile.
- Si Agent Skills no está disponible, Nuvetio debe seguir funcionando con sus skills propias.

## Archivos previstos

- `addons/agent-skills.json`: metadata canónica y atribución.
- `installers/macos/Instalar-Agent-Skills.command`: launcher opcional para Mac.
- `installers/windows/Instalar-Agent-Skills.ps1`: lógica opcional para Windows.
- `installers/windows/Instalar-Agent-Skills.cmd`: launcher de doble clic para Windows.
- `README.md`, `content/public-copy.es.json`, `docs/index.html`, `docs/guia-rapida.html`, `docs/soporte.html`: onboarding y límites.
- `tests/distribution.test.mjs`: contrato de metadata, seguridad y launchers.
- `submission/listing.es.md`, `submission/openai-portal-handoff.md`: aclaración de que Agent Skills es un complemento upstream opcional.

## Versionado y publicación

La primera implementación se publicará como una nueva versión de Nuvetio, sin mover ni reescribir tags existentes. El release incluirá el ZIP actualizado y la guía. El envío de Nuvetio al directorio oficial de ChatGPT seguirá siendo `skills-only`; el complemento externo no se declarará como infraestructura propia ni como aprobación de OpenAI.

## Criterios de aceptación

- El instalador base de Nuvetio no ejecuta comandos de Agent Skills.
- Los launchers opcionales ejecutan solamente los dos comandos upstream documentados y fallan claramente si Codex no está instalado.
- La metadata muestra autor, licencia, repositorio y versión de referencia.
- Las pruebas detectan ejecución remota insegura, elevación de privilegios o pérdida de la instalación base.
- `npm test`, `npm run validate` y `git diff --check` pasan.
- El ZIP público incluye ambos launchers opcionales y la documentación para principiantes.
