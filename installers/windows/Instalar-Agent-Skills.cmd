@echo off
setlocal
rem Upstream: https://github.com/addyosmani/agent-skills.git
rem Plugin: agent-skills@agent-skills
rem Confirmation: escribe SI en la ventana de PowerShell

where codex >nul 2>&1
if errorlevel 1 (
  echo No se pudo instalar Agent Skills: no encontramos Codex CLI.
  echo Instala Codex y vuelve a ejecutar este archivo.
  if not "%NUVETIO_INSTALL_NONINTERACTIVE%"=="1" pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Instalar-Agent-Skills.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

if "%EXIT_CODE%"=="0" (
  echo Agent Skills quedo instalado como complemento de Nuvetio.
) else (
  echo La instalacion no termino correctamente.
)

if not "%NUVETIO_INSTALL_NONINTERACTIVE%"=="1" pause
exit /b %EXIT_CODE%
