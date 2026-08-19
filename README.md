# Nuvetio

**Pregunta como siempre. Construye como un equipo profesional.**

**Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.**

Nuvetio convierte tus ideas y consultas en procesos claros de producto, diseño, inteligencia artificial e ingeniería. Tú explicas lo que necesitas con tus propias palabras; sus agentes te ayudan a analizarlo, mejorarlo y llevarlo a resultados concretos.

Sitio público: <https://mroa29.github.io/Nuvetio/>

## Para usuarios

1. Descarga `Nuvetio-0.2.2.zip` desde la release y descomprímelo en Descargas.
2. En Mac, abre `installers/macos` y haz doble clic en `Instalar-Nuvetio.command`. En Windows, abre `installers/windows` y haz doble clic en `Instalar-Nuvetio.cmd`.
3. Confirma el mensaje de instalación. No necesitas permisos de administrador ni pegar comandos.
4. Inicia una sesión nueva de Codex CLI y escribe tu consulta normalmente. Para ampliar el equipo, ejecuta después `installers/macos/Instalar-Agent-Skills.command` o `installers/windows/Instalar-Agent-Skills.cmd` y confirma escribiendo `SI`.

La instalación directa en ChatGPT estará disponible después de publicar Nuvetio en su directorio de Plugins. La extensión IDE de Codex no admite plugins.

## Para colaboradores

El repositorio contiene el manifiesto público, las skills estáticas, el complemento opcional Agent Skills, los instaladores, el sitio de documentación y las comprobaciones de distribución de Nuvetio. La versión 0.2.2 no habilita todavía backend, telemetría, conectores, MCP, cuentas de usuario ni aprendizaje compartido.

```powershell
npm test
npm run validate
```

Publicado por Marcos Roa.
