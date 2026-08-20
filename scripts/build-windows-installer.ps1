[CmdletBinding()]
param(
    [string] $Version = '0.5.0',
    [string] $OutputDirectory = (Join-Path $PSScriptRoot '..\..\dist\native')
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$iexpress = Join-Path $env:WINDIR 'System32\iexpress.exe'
$payloadFiles = @(
    '.agents',
    'plugins',
    'installers',
    'addons',
    'adapters',
    'departments',
    'learning',
    'packaging\LEEME-PRIMERO.txt',
    'docs\downloads\guia-rapida-nuvetio.pdf'
)

if (-not (Test-Path -LiteralPath $iexpress -PathType Leaf)) {
    throw "IExpress no está disponible en $iexpress."
}

foreach ($relative in $payloadFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot $relative))) {
        throw "Falta el payload requerido: $relative"
    }
}

$outputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$workDirectory = Join-Path ([IO.Path]::GetTempPath()) ("nuvetio-iexpress-" + [guid]::NewGuid().ToString('N'))
$staging = Join-Path $workDirectory 'staging'
New-Item -ItemType Directory -Force -Path $staging | Out-Null

try {
    foreach ($relative in $payloadFiles) {
        $source = Join-Path $repositoryRoot $relative
        $destination = Join-Path $staging $relative
        if ((Get-Item -LiteralPath $source).PSIsContainer) {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
            Copy-Item -LiteralPath $source -Destination $destination -Recurse
        } else {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
            Copy-Item -LiteralPath $source -Destination $destination
        }
    }

    $payloadZip = Join-Path $staging 'payload.zip'
    Compress-Archive -Path (Join-Path $staging '.agents'), (Join-Path $staging 'plugins'), (Join-Path $staging 'installers'), (Join-Path $staging 'addons'), (Join-Path $staging 'adapters'), (Join-Path $staging 'departments'), (Join-Path $staging 'learning'), (Join-Path $staging 'packaging'), (Join-Path $staging 'docs') -DestinationPath $payloadZip -CompressionLevel Optimal

    @'
@echo off
setlocal
set "PAYLOAD_DIR=%TEMP%\Nuvetio-%RANDOM%%RANDOM%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath '%~dp0payload.zip' -DestinationPath '%PAYLOAD_DIR%' -Force; & '%PAYLOAD_DIR%\installers\windows\Instalar-Nuvetio.ps1'; exit $LASTEXITCODE"
set "EXIT_CODE=%ERRORLEVEL%"
if not "%NUVETIO_INSTALL_NONINTERACTIVE%"=="1" pause
exit /b %EXIT_CODE%
'@ | Set-Content -LiteralPath (Join-Path $staging 'install.cmd') -Encoding ascii

    $target = Join-Path $outputDirectory ("Nuvetio-$Version-Setup.exe")
    $sed = @"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=1
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayPrompt=%DisplayPrompt%
FinishMessage=%FinishMessage%
TargetName=$target
FriendlyName=Nuvetio $Version
AppLaunched=cmd.exe /c install.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=<None>
UserQuietInstCmd=<None>
SourceFiles=SourceFiles
[Strings]
InstallPrompt=Instalar Nuvetio $Version ahora?
DisplayPrompt=Instalador Nuvetio
FinishMessage=Nuvetio quedó instalado. Abre una sesión nueva de Codex.
FILE0=payload.zip
FILE1=install.cmd
[SourceFiles]
SourceFiles0=$staging
[SourceFiles0]
%FILE0%=
%FILE1%=
"@
    $sedPath = Join-Path $workDirectory 'Nuvetio.sed'
    $sed | Set-Content -LiteralPath $sedPath -Encoding ascii
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Force
    }
    & $iexpress /N $sedPath
    $iexpressExitCode = $LASTEXITCODE
    for ($attempt = 0; $attempt -lt 120 -and -not (Test-Path -LiteralPath $target -PathType Leaf); $attempt++) {
        Start-Sleep -Seconds 1
    }
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
        throw "IExpress no pudo crear $target"
    }
    (Get-FileHash -Algorithm SHA256 -LiteralPath $target).Hash | Set-Content -LiteralPath "$target.sha256" -Encoding ascii
    Write-Output $target
} finally {
    if (Test-Path -LiteralPath $workDirectory) {
        Remove-Item -LiteralPath $workDirectory -Recurse -Force
    }
}
