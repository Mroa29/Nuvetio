$ErrorActionPreference = 'Stop'

$packageRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$marketplace = Join-Path $packageRoot '.agents\plugins\marketplace.json'
$codexCommand = Get-Command codex -ErrorAction SilentlyContinue

function Stop-Installation([string] $Message) {
    Write-Host "No se pudo instalar Nuvetio: $Message" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path -LiteralPath $marketplace -PathType Leaf)) {
    Stop-Installation 'el paquete está incompleto; vuelve a descargarlo desde la página oficial.'
}

if (-not $codexCommand -and $env:NUVETIO_INSTALL_NONINTERACTIVE -ne '1') {
    $answer = Read-Host 'No encontramos Codex CLI. ¿Quieres instalarlo desde npm ahora? [s/N]'
    if ($answer -match '^(s|si|sí|y|yes)$' -and (Get-Command npm -ErrorAction SilentlyContinue)) {
        $env:NUVETIO_INSTALL_CODEX_CLI = '1'
        npm install --global '@openai/codex'
        $codexCommand = Get-Command codex -ErrorAction SilentlyContinue
    } elseif ($answer -match '^(s|si|sí|y|yes)$') {
        Write-Host 'No encontramos npm. Puedes instalar Codex CLI desde la guía oficial o usar Claude Code.' -ForegroundColor Yellow
    }
}

if ($codexCommand) {
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
} elseif (Get-Command claude -ErrorAction SilentlyContinue) {
    Write-Host 'Nuvetio quedó copiado correctamente.' -ForegroundColor Green
    Write-Host 'Detectamos Claude Code; consulta la guía para activar el adaptador de Nuvetio.'
    Write-Host 'Codex CLI es opcional y no es necesario para continuar.'
} else {
    Write-Host 'Nuvetio quedó copiado correctamente, pero todavía no hay un runtime compatible activado.' -ForegroundColor Yellow
    Write-Host 'Puedes abrir Codex Desktop, instalar Codex CLI desde la guía oficial o instalar Claude Code.'
    Write-Host 'Vuelve a ejecutar este instalador cuando quieras activar Nuvetio.'
}
