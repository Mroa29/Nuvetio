# Aprendizaje compartido de Nuvetio (base local 0.4.0)

Esta versión incorpora la base segura, no un entrenamiento automático:

1. En el primer uso, la persona elige explícitamente `Permitir aprendizaje`
   o `No permitir`. La decisión se guarda localmente y no se vuelve a pedir
   mientras no se revoque.
2. Después de una respuesta se puede mostrar:
   **¿Te fue útil esta respuesta? Opcional: ¿qué mejorarías?**
3. `redact.mjs` elimina automáticamente correos, teléfonos, tokens, rutas
   locales y secretos con formato reconocible antes de crear un candidato.
4. `queue.mjs` guarda candidatos anonimizados en una cola local JSONL. No los
   envía a Internet y no contiene conversaciones completas.
5. Un proceso de revisión debe agrupar patrones, evaluar calidad y aprobar una
   mejora para una futura versión. Ningún candidato modifica un modelo o una
   skill inmediatamente.

El backend compartido, la retención, los controles de acceso y la publicación
de mejoras quedan pendientes de una implementación posterior y de una política
de privacidad aprobada. El usuario puede revocar el consentimiento y eliminar
la cola local.
