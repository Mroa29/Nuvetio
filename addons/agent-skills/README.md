# Agent Skills (complemento opcional)

Agent Skills es el pack upstream de 24 workflows de ingeniería de Addy Osmani,
publicado bajo licencia MIT. Nuvetio lo distribuye como complemento separado:
no copia sus skills dentro del plugin principal y sigue funcionando si decides
no activarlo.

## Activación segura

La activación requiere que la persona confirme explícitamente `SI`. Solo
después de esa confirmación se conecta al repositorio público fijado en
`manifest.json`; revisa la versión y el commit antes de habilitarlo. No se
comparten credenciales, conversaciones ni memoria con Nuvetio.

En Codex CLI, el instalador opcional registra el marketplace upstream y añade
`agent-skills@agent-skills`. En Claude Code, abre una sesión y usa los comandos
oficiales `/plugin marketplace add https://github.com/addyosmani/agent-skills.git`
y `/plugin install agent-skills@addy-agent-skills`.

Agent Skills no modifica el modelo ni el comportamiento de Nuvetio por sí solo;
solo añade workflows que el usuario puede invocar.
