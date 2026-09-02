# Builds the Electron desktop app (installer source).
# Run publish_backend.ps1 FIRST - this packages whatever is already sitting in
# GestioPro.Api/bin/Release/net10.0/win-x64/publish/, stale or not, with no warning.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$backendPublish = "GestioPro.Api/bin/Release/net10.0/win-x64/publish"
if (-not (Test-Path "$backendPublish/GestioPro.Api.exe")) {
    Write-Warning "$backendPublish/GestioPro.Api.exe not found - run publish_backend.ps1 first, otherwise the installer will have no backend at all."
    $answer = Read-Host "Continue anyway? (y/N)"
    if ($answer -ne "y") { exit 1 }
}

Set-Location frontend
npm run electron:build
