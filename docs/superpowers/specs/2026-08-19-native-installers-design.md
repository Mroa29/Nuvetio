# Instaladores nativos de Nuvetio — Diseño

## Objetivo

Convertir la descarga pública de Nuvetio en una experiencia guiada para usuarios no técnicos: descargar un instalador para su sistema, seguir `Siguiente → Instalar → Finalizar` y abrir una sesión nueva de Codex. La página pública mostrará únicamente los instaladores nativos y la guía rápida; el ZIP permanecerá disponible como respaldo técnico en la release, pero no será visible como llamada principal.

## Alcance

- Windows: instalador `.exe` autoextraíble construido con IExpress, sin descarga de código remoto y sin elevación forzada.
- Mac: instalador `.pkg` construido en un runner macOS con `pkgbuild`; incluirá el payload local y un script de postinstalación que registra Nuvetio en Codex para el usuario activo.
- Web: botones separados para Windows, Mac y guía rápida, con detección visual del sistema cuando sea posible.
- ZIP: conservarlo en la release para soporte y recuperación, sin enlazarlo desde la página principal.
- OpenAI: mantener un handoff explícito y separado para la futura publicación directa en el directorio oficial de Plugins; esta entrega no fingirá que Nuvetio ya está instalado dentro de ChatGPT.

## No objetivos

- No firmar binarios en esta primera iteración. La web debe advertir que Windows o macOS pueden mostrar una alerta de desarrollador no identificado.
- No instalar Agent Skills automáticamente; seguirá siendo un complemento opcional con confirmación explícita.
- No añadir backend, telemetría, cuentas, MCP ni aprendizaje compartido.
- No pedir permisos de administrador en Windows. En Mac, el `.pkg` usará la ruta de instalación definida por el paquete y documentará cualquier solicitud de contraseña del instalador del sistema.

## Arquitectura

El contenido portable existente seguirá siendo la única fuente de verdad: `.agents`, `plugins`, `installers`, `addons` y la guía. Un manifiesto de build describirá esos archivos. El artefacto Windows se generará con una directiva IExpress que extrae el payload a una carpeta temporal y ejecuta el instalador PowerShell ya validado. El artefacto Mac se generará en GitHub Actions `macos-latest`: `pkgbuild` empaquetará el payload y un script `postinstall` ejecutará el registro local de Codex sin contactar repositorios externos.

Cada instalador debe:

1. Validar que Codex CLI esté disponible.
2. Validar que el payload no esté incompleto.
3. Registrar el marketplace local y activar `nuvetio@nuvetio`.
4. Mostrar una confirmación visible y un siguiente paso.
5. Mostrar un error accionable si alguna etapa falla.

## Seguridad y privacidad

- El instalador base nunca ejecutará `curl | sh`, descargará scripts ni solicitará credenciales.
- El complemento Agent Skills conserva su launcher separado y la confirmación `SI` antes de conectarse a GitHub.
- Los instaladores no recopilarán datos ni modificarán el modelo.
- Los binarios no firmados se identificarán como una limitación de distribución, no como una garantía de confianza.

## Verificación

- Pruebas TDD para manifiesto, enlaces públicos, payload y directivas de build.
- Smoke test Windows con IExpress o su modo de extracción en un `CODEX_HOME` temporal y un Codex simulado.
- Build de GitHub Actions en Windows y macOS; validar que `.exe` y `.pkg` existan y que sus hashes coincidan con los artefactos publicados.
- QA HTTP de la página: solo instaladores y guía visibles; ZIP no enlazado desde `docs/index.html`.
- Revisión final de diff, secretos, permisos, pruebas y `npm run validate`.
