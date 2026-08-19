$ErrorActionPreference = 'Stop'

$packageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$marketplace = Join-Path $packageRoot '.agents\plugins\marketplace.json'
$codexCommand = Get-Command codex -ErrorAction SilentlyContinue

function Stop-Installation([string] $Message) {
    Write-Host "No se pudo instalar Nuvetio: $Message" -ForegroundColor Red
    exit 1
}

if (-not $codexCommand) {
    Stop-Installation 'no encontramos Codex CLI. Instálalo y vuelve a ejecutar este archivo.'
}

if (-not (Test-Path -LiteralPath $marketplace -PathType Leaf)) {
    Stop-Installation 'el paquete está incompleto; vuelve a descargarlo desde la página oficial.'
}

& $codexCommand.Source plugin marketplace add $packageRoot
if ($LASTEXITCODE -ne 0) {
    Stop-Installation 'Codex no pudo registrar el marketplace local.'
}

& $codexCommand.Source plugin add 'nuvetio@nuvetio'
if ($LASTEXITCODE -ne 0) {
    Stop-Installation 'Codex no pudo activar el plugin.'
}

Write-Host 'Nuvetio quedó instalado en Codex.' -ForegroundColor Green
Write-Host 'Abre una sesión nueva de Codex para comenzar.'
