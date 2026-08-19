# Nuvetio

**Pregunta como siempre. Construye como un equipo profesional.**

**Tu equipo experto de IA, listo para convertir preguntas cotidianas en resultados profesionales.**

Nuvetio convierte tus ideas y consultas en procesos claros de producto, diseño, inteligencia artificial e ingeniería. Tú explicas lo que necesitas con tus propias palabras; sus agentes te ayudan a analizarlo, mejorarlo y llevarlo a resultados concretos.

Sitio público: <https://mroa29.github.io/Nuvetio/>

## Para usuarios

1. Descarga el instalador para Windows (`Nuvetio-0.3.0-Setup.exe`) o Mac (`Nuvetio-0.3.0.pkg`) desde la release.
2. Ábrelo y sigue `Siguiente`, `Instalar` y `Finalizar`. Puede aparecer una advertencia porque el instalador todavía no está firmado.
3. Abre una sesión nueva de Codex CLI y escribe tu consulta normalmente. Para ampliar el equipo, activa después el complemento opcional Agent Skills y confirma escribiendo `SI`.

La instalación directa en ChatGPT estará disponible después de publicar Nuvetio en su directorio de Plugins. La extensión IDE de Codex no admite plugins.

## Para colaboradores

El repositorio contiene el manifiesto público, las skills estáticas, el complemento opcional Agent Skills, los instaladores nativos, el sitio de documentación y las comprobaciones de distribución de Nuvetio. La versión 0.3.0 no habilita todavía backend, telemetría, conectores, MCP, cuentas de usuario ni aprendizaje compartido.

```powershell
npm test
npm run validate
```

Publicado por Marcos Roa.
