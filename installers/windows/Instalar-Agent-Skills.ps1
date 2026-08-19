$ErrorActionPreference = 'Stop'

function Stop-Installation([string] $Message) {
    Write-Host "No se pudo instalar Agent Skills: $Message" -ForegroundColor Red
    exit 1
}

$codexCommand = Get-Command codex -ErrorAction SilentlyContinue
if (-not $codexCommand) {
    Stop-Installation 'no encontramos Codex CLI. Instálalo y vuelve a ejecutar este archivo.'
}

if ($env:NUVETIO_INSTALL_NONINTERACTIVE -eq '1') {
    $answer = 'SI'
} else {
    Write-Host 'Agent Skills es un complemento opcional de Nuvetio.'
    Write-Host 'Se conectará al repositorio público de Addy Osmani (licencia MIT) para instalar 24 skills.'
    $answer = Read-Host '¿Quieres instalarlo? Escribe SI para continuar'
}

if ($answer -notmatch '^(?i:si|sí|s)$') {
    Write-Host 'No se instaló Agent Skills. Nuvetio seguirá funcionando normalmente.'
    exit 0
}

& $codexCommand.Source plugin marketplace add 'https://github.com/addyosmani/agent-skills.git'
if ($LASTEXITCODE -ne 0) {
    Stop-Installation 'Codex no pudo registrar el marketplace upstream.'
}

& $codexCommand.Source plugin add 'agent-skills@agent-skills'
if ($LASTEXITCODE -ne 0) {
    Stop-Installation 'Codex no pudo activar el complemento.'
}

Write-Host 'Agent Skills quedó instalado como complemento de Nuvetio.' -ForegroundColor Green
Write-Host 'Abre una sesión nueva de Codex para usar sus workflows.'
