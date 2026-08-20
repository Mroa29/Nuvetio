# Nuvetio Learning Worker

Este Worker recibe únicamente candidatos anonimizados generados por el runtime
local cuando la persona otorgó el consentimiento compartido.

## Configuración

1. Crear una base D1 propia y aplicar `migrations/0001_learning.sql`.
2. Copiar `wrangler.toml.example` a `wrangler.toml` y reemplazar únicamente el
   identificador de la base creada.
3. Guardar el token de revisión como secreto:

```sh
wrangler secret put NUVETIO_REVIEW_TOKEN
```

4. Publicar el Worker con `wrangler deploy`.

No se incluyen credenciales, IDs reales ni endpoints de producción en el
repositorio. Antes de activar el endpoint en usuarios reales se debe revisar la
política de privacidad, límites de frecuencia y acceso de administradores.
