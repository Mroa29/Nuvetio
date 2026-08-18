# Nuvetio

**Pregunta como siempre. Construye como un equipo profesional.**

**Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.**

Nuvetio convierte tus ideas y consultas en procesos claros de producto, diseño, inteligencia artificial e ingeniería. Tú explicas lo que necesitas con tus propias palabras; sus agentes te ayudan a analizarlo, mejorarlo y llevarlo a resultados concretos.

Sitio público previsto tras la migración: <https://mroa29.github.io/Nuvetio/>

## Para usuarios

1. Descarga `Nuvetio-0.2.0.zip` desde la release y descomprímelo en Descargas.
2. Abre Terminal y ejecuta `cd ~/Downloads/Nuvetio-0.2.0`.
3. Ejecuta `codex plugin marketplace add .` y después `codex plugin add nuvetio@nuvetio`.
4. Inicia una sesión nueva de Codex CLI y escribe tu consulta normalmente.

La instalación directa en ChatGPT estará disponible después de publicar Nuvetio en su directorio de Plugins. La extensión IDE de Codex no admite plugins.

## Para colaboradores

El repositorio contiene el manifiesto público, las skills estáticas, el sitio de documentación y las comprobaciones de distribución de Nuvetio. La versión 0.2.0 no habilita todavía backend, telemetría, conectores, MCP, cuentas de usuario ni aprendizaje compartido.

```powershell
npm test
npm run validate
```

Publicado por Marcos Roa.
