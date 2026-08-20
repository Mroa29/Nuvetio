# Firma de instaladores

La release candidate 0.4.0 se distribuye **UNSIGNED**. El instalador puede
mostrar una advertencia del sistema hasta que el equipo aporte certificados.
No se debe afirmar que está firmado o notarizado sin verificar la firma en un
equipo limpio.

## Cuando existan certificados

- macOS: usar un certificado Developer ID Installer, firmar el `.pkg`, enviarlo
  a notarización con credenciales almacenadas como secretos de CI y verificar
  `spctl`/`stapler` antes de publicar.
- Windows: usar un certificado Authenticode protegido por el almacén de
  secretos, firmar el `.exe` con `signtool` y verificar la cadena y el sello de
  tiempo antes de publicar.

El workflow `sign-installers.yml` se detiene y conserva la etiqueta `UNSIGNED`
si faltan secretos. Nunca descarga certificados, pide credenciales al usuario ni
crea una firma de demostración.
