# Nuvetio 0.4.0 — Diseño completo multiplataforma

## Estado

Diseño aprobado por Marcos Roa el 20 de agosto de 2026. La implementación
debe permanecer local hasta completar pruebas y recibir autorización explícita
para publicar una nueva release.

## Objetivo

Convertir Nuvetio en una distribución portable y sencilla para usuarios de
Codex y Claude Code, con instaladores que no fallen por dependencias ausentes,
un equipo ampliado de departamentos, video de presentación local y un sistema
de aprendizaje compartido anonimizado que nunca modifique un modelo de forma
automática.

## Alcance de v0.4.0

### 1. Instalación multiplataforma

- El instalador Mac debe finalizar correctamente aunque no encuentre `codex`.
- El instalador Windows debe tener el mismo comportamiento tolerante.
- Si existe Codex CLI, el instalador puede registrar el marketplace y activar
  Nuvetio automáticamente.
- Si no existe Codex CLI, el instalador debe ofrecer, con consentimiento
  explícito, instalar el cliente oficial; nunca debe manejar credenciales.
- El instalador debe detectar y distinguir Codex CLI, Codex Desktop y Claude
  Code, mostrando la ruta correcta para cada uno.
- Los errores deben quedar en un registro legible y no en el resumen genérico
  de macOS.
- No se descargará código remoto sin consentimiento; los binarios y hashes
  utilizados deben quedar identificados en la metadata de build.

### 2. Compatibilidad con Claude Code

- `plugins/nuvetio/skills/operate-nuvetio/SKILL.md` seguirá siendo la fuente
  canónica y neutral del flujo.
- Se añadirá un adaptador Claude Code que instale la skill en el alcance elegido
  por el usuario: proyecto (`.claude/skills`) o perfil de usuario
  (`~/.claude/skills`).
- Se añadirá un `CLAUDE.md` de integración que explique cómo activar Nuvetio,
  sin sobrescribir instrucciones existentes.
- Los instaladores y la guía ofrecerán Codex y Claude en rutas paralelas; una
  instalación de uno no alterará la configuración del otro.
- Se probará activación con `codex` y `claude` simulados en entornos aislados,
  y se documentará que la autenticación pertenece a cada proveedor.

### 3. Equipo de agentes y departamentos

Los departamentos activos existentes se conservarán:

- Orquestador.
- Producto e IA.
- Experiencia y Mockups.
- Ingeniería.
- Calidad y Seguridad.
- Core operativo: skills, memoria, validación y herramientas.

Se incorporarán cuatro departamentos consultivos nuevos, con límites claros:

- Marketing: posicionamiento, audiencias, contenidos, campañas y métricas.
- Operaciones: procesos, documentación, coordinación y mejora continua.
- Finanzas: costos, presupuestos, escenarios y supuestos; no reemplaza
  asesoría financiera profesional.
- Legal: riesgos, contratos, privacidad y cumplimiento; no reemplaza asesoría
  legal profesional.

El diagrama visual mostrará el Orquestador en el centro, los departamentos
activos en una capa primaria y los consultivos en una capa secundaria. Cada
departamento tendrá agentes, responsabilidad, entradas, salida esperada y
límites visibles.

### 4. Agent Skills

- Agent Skills quedará distribuido dentro del paquete de Nuvetio para evitar
  que el usuario deba localizar un segundo instalador.
- Su activación seguirá siendo opcional y requerirá consentimiento explícito.
- Se conservarán atribución, licencia MIT, versión upstream y hash del paquete.
- Si el upstream no puede verificarse o cambia de forma incompatible, Nuvetio
  seguirá funcionando con sus skills propias.
- El adaptador se expondrá tanto para Codex como para Claude Code.

### 5. Aprendizaje compartido anonimizado

Se implementará una base segura para aprender de uso sin entrenar el modelo
automáticamente:

1. En el primer uso se solicita consentimiento explícito y se guarda la
   preferencia localmente.
2. La respuesta puede terminar con una pregunta breve: “¿Te fue útil?”.
3. Solo se captura feedback voluntario y estructurado, nunca la conversación
   completa por defecto.
4. Un redactor elimina nombres, correos, teléfonos, tokens, rutas privadas,
   identificadores y contenido sensible antes de almacenar un candidato.
5. Los candidatos se agrupan por patrón y pasan a revisión humana.
6. Solo las mejoras aprobadas se incorporan a una versión nueva de skills,
   referencias o prompts.
7. No existe actualización neuronal inmediata, fine-tuning automático ni
   modificación silenciosa del comportamiento.

La primera entrega incluirá contrato de datos, redactor, consentimiento,
feedback local y cola exportable. El backend público, retención, autenticación,
control de acceso y despliegue requieren credenciales y una política de
privacidad aprobada; no se simulará que están activos si no lo están.

### 6. Video de presentación

- Video local de 55–60 segundos, 16:9, H.264/AAC.
- Narración real de Marcos; la grabación fuente permanecerá fuera de Git.
- Seis escenas ilustradas originales, animaciones, subtítulos incrustados y
  pista WebVTT equivalente.
- Música original suave sintetizada localmente.
- Controles accesibles, sin autoplay y reproducción responsive en escritorio y
  teléfono.
- Se revisará emoción, inteligibilidad, mezcla y comprensión sin audio antes
  de integrar el archivo en la página.

### 7. Firma y distribución

- Se añadirá pipeline para firma/notarización de Mac y firma Authenticode de
  Windows.
- Sin certificados Apple Developer y certificado Windows no se declarará una
  build como firmada; se mantendrá un fallback unsigned claramente advertido.
- La publicación directa en ChatGPT quedará preparada como submission skills-only
  y se ejecutará solo mediante el portal oficial y su revisión.

## Arquitectura de paquetes

```text
Nuvetio/
├── plugins/nuvetio/                 # fuente canónica neutral
├── adapters/codex/                  # marketplace y activación Codex
├── adapters/claude/                 # .claude/skills + CLAUDE.md
├── addons/agent-skills/             # companion verificado y opcional
├── departments/                    # catálogo y límites de agentes
├── learning/                        # consentimiento, redactor y cola local
├── content/video/                   # timeline, captions y metadata
├── installers/                     # detección y flujo por plataforma
└── docs/                            # página, guía, diagrama y soporte
```

Cada adaptador consume la misma skill canónica; ningún runtime debe mantener
una copia divergente de la lógica de orquestación.

## Seguridad y privacidad

- Nunca se almacenan credenciales de Codex, Claude, OpenAI o Anthropic.
- No se ejecutan scripts remotos sin consentimiento y verificación de origen.
- El instalador no eleva privilegios salvo la autorización nativa solicitada por
  el sistema operativo.
- El learning pipeline aplica minimización de datos y permite revocar el
  consentimiento y borrar la cola local.
- Finanzas y Legal se presentan como apoyo informativo y siempre muestran sus
  límites.

## Criterios de aceptación

- Mac sin `codex`: el instalador termina con instrucciones accionables y código
  de salida exitoso.
- Mac con `codex`: registra y activa Nuvetio.
- Windows sin `codex`: el instalador termina sin error y ofrece recuperación.
- Claude Code: la skill queda disponible en proyecto o perfil elegido sin
  sobrescribir `CLAUDE.md` existente.
- Nuvetio y Agent Skills funcionan independientemente.
- La página muestra el diagrama de diez departamentos y sus límites.
- Consentimiento, redacción y feedback tienen pruebas automatizadas.
- Video cumple duración, codec, captions, poster, responsive y tamaño acordado.
- `npm test`, `npm run validate`, revisión de diff y pruebas de instalación
  aisladas pasan antes de cualquier publicación.
- La release no se publica como firmada ni disponible en ChatGPT hasta contar
  con evidencia real de firma o aprobación del portal.

## Fuera de alcance

- Entrenamiento neuronal automático o modificación inmediata del modelo.
- Almacenamiento de conversaciones completas por defecto.
- Copiar credenciales entre Codex, Claude y ChatGPT.
- Presentar Finanzas o Legal como asesoría profesional.
- Prometer publicación en ChatGPT sin revisión oficial.
