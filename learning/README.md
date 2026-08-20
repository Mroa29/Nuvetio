# Aprendizaje compartido de Nuvetio (base local 0.5.0)

Esta versión incorpora la base segura, no un entrenamiento automático:

1. En el primer uso, la persona elige por separado si permite aprendizaje local
   y si permite aportar candidatos anonimizados al aprendizaje compartido. Las
   dos decisiones parten desactivadas, se guardan localmente y no se vuelven a
   pedir mientras no se revoquen.
2. Después de una respuesta se puede mostrar:
   **¿Te fue útil esta respuesta? Opcional: ¿qué mejorarías?**
3. `redact.mjs` elimina automáticamente correos, teléfonos, tokens, rutas
   locales y secretos con formato reconocible antes de crear un candidato.
4. `queue.mjs` guarda candidatos anonimizados en una cola local JSONL. Solo si
   existe el segundo consentimiento, `shared-client.mjs` envía el candidato
   estructurado al Worker configurado; nunca envía conversaciones completas.
5. Cada candidato vence a los 90 días si no se aprueba. Un proceso de revisión
   debe agrupar patrones, evaluar calidad y aprobar una mejora para una futura
   versión. Ningún candidato modifica un modelo o una skill inmediatamente.

El Worker compartido, la retención, los controles de acceso y la publicación de
mejoras requieren configuración de una cuenta Cloudflare y una política de
privacidad aprobada. El usuario puede revocar ambos consentimientos y eliminar
la cola local.
