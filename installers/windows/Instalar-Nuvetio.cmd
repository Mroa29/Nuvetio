@echo off
setlocal

where codex >nul 2>&1
if errorlevel 1 (
  echo No se pudo instalar Nuvetio: no encontramos Codex CLI.
  echo Instala Codex y vuelve a ejecutar este archivo.
  if not "%NUVETIO_INSTALL_NONINTERACTIVE%"=="1" pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Instalar-Nuvetio.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

if "%EXIT_CODE%"=="0" (
  echo Nuvetio quedo instalado en Codex.
  echo Abre una sesion nueva de Codex para comenzar.
) else (
  echo La instalacion no termino correctamente.
)

if not "%NUVETIO_INSTALL_NONINTERACTIVE%"=="1" pause
exit /b %EXIT_CODE%
