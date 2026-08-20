# Nuvetio 0.4.0 — informe de release candidate

Fecha: 2026-08-20  
Rama: `codex/nuvetio-v040-market`  
HEAD de implementación verificado: `38f4ccf602f6433ee9af7155d5139d7019361bbb`  
Autor/committer: Marcos_Roa `<marcos.roa.ocampos@gmail.com>`

## Alcance entregado

- Instaladores Mac/Windows que copian Nuvetio aunque Codex CLI falte o no sea
  ejecutable; muestran recuperación para Codex Desktop, Codex CLI y Claude Code.
- Adaptador Claude Code (`adapters/claude`) que preserva un `CLAUDE.md`
  existente y copia la skill al perfil del usuario.
- Agent Skills 0.6.7 como complemento opcional, MIT, atribuido a Addy Osmani y
  fijado al commit upstream `df1edb2e05487d0aa6d93c747141e0aed1187f25`.
- Catálogo de diez departamentos con agentes, funciones, entradas, salidas y
  límites; diagrama SVG accesible y responsive en la página pública.
- Aprendizaje compartido local: consentimiento inicial, pregunta opcional
  “¿Te fue útil?”, redacción de datos sensibles y cola JSONL exportable. No hay
  backend, telemetría ni modificación automática de modelos.
- Gate de firma preparado: la metadata y los artefactos permanecen `UNSIGNED`
  hasta disponer de certificados verificables.
- Handoff de ChatGPT preparado como `NOT SUBMITTED`; el video de presentación
  permanece explícitamente pendiente y no forma parte de 0.4.0.

## Verificación

- `npm test`: **39/39 PASS**.
- `npm run validate`: **PASS**.
- `git diff --check`: **PASS**.
- Escaneo de secretos del árbol público: **clean**.
- Builder Windows/IExpress: generó `dist/native/Nuvetio-0.4.0-Setup.exe`.
  SHA-256 local: `D6E023E190202B5A153210E160EAA2AC56D4A2BE9620676009D2685C0655CF8D`.
- Smoke Windows no interactivo: Codex Desktop/CLI detectado pero no ejecutable
  por permisos del entorno; el instalador recuperó sin error (`exit 0`) y pasó
  a Claude Code, sin dejar la instalación en estado fallido. El adaptador creado
  durante el smoke fue retirado después.
- HTTP local: homepage, SVG de departamentos, mascota y soporte devolvieron
  `200`; no quedó listener en el puerto 4173 al finalizar.

## Gates pendientes

- El `.pkg` de macOS no se construyó en Windows; debe ejecutarse en `macos-latest`
  o en un Mac limpio mediante el workflow.
- No se firmó ni notarizó ningún instalador: faltan certificados y secretos de
  CI. El workflow de firma se detiene sin etiquetar artefactos falsamente.
- La publicación de `main`, el tag/release `v0.4.0` y el envío al portal de
  ChatGPT no se ejecutaron. Requieren una aprobación final inmediatamente antes
  de hacerlos.
