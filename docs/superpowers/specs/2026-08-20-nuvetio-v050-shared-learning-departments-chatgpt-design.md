# Nuvetio v0.5 — aprendizaje compartido, departamentos activos y envío oficial

**Fecha:** 2026-08-20  
**Estado:** Diseño aprobado para revisión  
**Alcance:** puntos 3, 4 y 6 del roadmap de Nuvetio

## Objetivo

Extender Nuvetio con una base de aprendizaje compartido anonimizado, activar Marketing, Operaciones, Finanzas y Legal como departamentos consultivos seleccionables por el orquestador, y dejar preparado el paquete para su envío oficial como aplicación `skills-only` en ChatGPT.

La versión no entrenará ni modificará modelos automáticamente. Las mejoras solo podrán incorporarse mediante una nueva versión revisada.

## Decisiones aprobadas

- Backend: Cloudflare Worker + D1.
- Consentimiento: dos permisos independientes y desactivados inicialmente:
  1. aprendizaje local;
  2. aporte compartido anonimizado.
- Persistencia compartida: candidatos anonimizados durante 90 días.
- Eliminación: expiración automática de candidatos no aprobados y eliminación manual disponible.
- Departamentos: Marketing, Operaciones, Finanzas y Legal pasan de `consultive` de roadmap a `active-consultive`.
- ChatGPT: preparación del envío, pero el estado permanece `NOT SUBMITTED` hasta la acción humana en el portal oficial.

## Arquitectura

### Flujo de aprendizaje

1. El runtime muestra el consentimiento doble en el primer uso.
2. La decisión se guarda localmente y no se vuelve a preguntar, salvo revocación.
3. Tras una respuesta, el usuario puede indicar si fue útil y escribir una mejora opcional.
4. La base local redacta correos, teléfonos, tokens, rutas, secretos, nombres identificables y contenido sensible.
5. Si el segundo consentimiento está activo, se genera un candidato estructurado.
6. El cliente envía únicamente ese candidato al Worker.
7. El Worker valida tamaño, versión de esquema, campos permitidos y límites de frecuencia.
8. D1 guarda el candidato con estado `pending_review` y vencimiento a 90 días.
9. Un revisor agrupa patrones, marca riesgos y decide `approved` o `rejected`.
10. Las mejoras aprobadas se convierten en cambios versionados de skills, copy o tests.
11. Una nueva versión de Nuvetio se publica después de pasar sus gates.

### Worker y D1

El Worker expondrá una API mínima:

- `POST /v1/candidates`: recibe un candidato ya redactado.
- `GET /v1/health`: devuelve disponibilidad sin datos de usuarios.
- `POST /v1/deletion-requests`: registra una solicitud de eliminación usando el identificador del candidato.

El Worker no aceptará conversaciones completas, archivos, prompts sin redactar ni credenciales. No guardará dirección IP, user-agent ni identificadores persistentes de persona. Aplicará CORS limitado para el sitio cuando corresponda, límite de tamaño y rate limiting.

Tabla principal `learning_candidates`:

- `id`
- `schema_version`
- `category`
- `feedback_signal`
- `abstract`
- `redaction_flags`
- `policy_version`
- `created_at`
- `expires_at`
- `status`

Tabla de auditoría `review_events`:

- `id`
- `candidate_id`
- `action`
- `reviewer_ref`
- `notes`
- `created_at`

La revisión será una superficie protegida para administradores. No se construirá un panel público ni se expondrán candidatos anónimos sin revisión.

### Retención y privacidad

- Los candidatos pendientes, rechazados o expirados se eliminan automáticamente al superar 90 días.
- Los candidatos aprobados conservarán solo el resumen mínimo necesario para justificar la mejora.
- La cola local seguirá siendo eliminable por el usuario.
- La política de privacidad explicará qué se guarda, por cuánto tiempo y cómo revocar.
- El sistema no promete anonimización perfecta; la redacción y revisión reducen riesgo, pero no sustituyen una política legal ni una revisión de privacidad.

## Departamentos activos consultivos

Cada departamento tendrá:

- definición en `departments/nuvetio-departments.json`;
- skill o referencia con criterios de activación;
- entradas, salidas y límites;
- casos positivos, negativos y de seguridad;
- ruta en el orquestador;
- prueba de no ejecución externa sin autorización.

Departamentos:

- **Marketing:** posicionamiento, audiencias, mensajes y experimentos.
- **Operaciones:** procesos, SOP, RACI y mejora continua.
- **Finanzas:** costos, presupuestos y escenarios explicables.
- **Legal:** privacidad, contratos, cumplimiento y riesgos por jurisdicción.

Los cuatro siguen siendo consultivos: no publican campañas, no transfieren dinero, no firman contratos y no entregan asesoría profesional acreditada.

## Preparación para ChatGPT

El paquete oficial será `skills-only`, sin MCP, conectores, backend obligatorio ni autenticación externa para el uso local.

Se revisarán y dejarán listos:

- manifest y bundle público;
- descripción corta y larga;
- starter prompts;
- casos positivos y negativos;
- privacidad, términos y soporte;
- release `v0.4.0`;
- atribución de Agent Skills como complemento upstream opcional.

El archivo de handoff conservará `NOT SUBMITTED`. La persona propietaria deberá iniciar sesión en el portal oficial, verificar identidad, crear el envío, ejecutar los casos solicitados y detenerse antes de enviar para revisión hasta confirmar explícitamente.

## Gates de seguridad

No se considera listo si:

- el candidato contiene datos personales o secretos;
- el usuario no otorgó ambos consentimientos necesarios;
- el Worker acepta texto sin el esquema esperado;
- se ejecuta una mejora directamente sobre el modelo;
- un departamento ejecuta acciones externas sin aprobación;
- la página afirma que Nuvetio está publicado oficialmente en ChatGPT sin evidencia;
- se etiquetan instaladores como firmados sin certificados verificables.

## Verificación

La implementación deberá incluir:

- tests unitarios de consentimiento, redacción, esquema y expiración;
- tests del Worker con payload válido, inválido, duplicado y demasiado grande;
- pruebas de routing para los cuatro departamentos;
- casos negativos de límites profesionales;
- validación de privacidad y ausencia de secretos;
- pruebas locales del flujo de envío y eliminación;
- actualización del handoff sin cambiar `NOT SUBMITTED`;
- `npm test`, `npm run validate` y revisión del diff.

## Fuera de alcance de esta versión

- entrenamiento automático o fine-tuning;
- publicación automática de mejoras;
- almacenamiento de conversaciones completas;
- autenticación de usuarios finales;
- facturación o planes comerciales;
- envío automático a OpenAI;
- firma digital de instaladores;
- video de presentación.

