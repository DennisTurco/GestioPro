# Publishes the backend for Windows distribution.
# Run this BEFORE build_electron.ps1 (which packages this output into the installer).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$prodSettings = "GestioPro.Api/appsettings.Production.json"
if (-not (Test-Path $prodSettings)) {
    Write-Warning "$prodSettings not found - the published backend will fall back to the dev/placeholder Jwt secret and won't have a Supabase connection string. Copy appsettings.Production.json.example and fill it in first."
    $answer = Read-Host "Continue anyway? (y/N)"
    if ($answer -ne "y") { exit 1 }
}

# --self-contained true: bundles the matching .NET runtime with the app, so end users
# don't need anything preinstalled. A missing runtime on a plain user's PC is exactly
# what made the packaged backend silently fail to start (Electron spawns it with
# stdio: 'ignore', so there was no visible error - the frontend just got "Failed to
# fetch" since nothing was listening on the port).
dotnet publish GestioPro.Api -c Release -r win-x64 --self-contained true -o GestioPro.Api/bin/Release/net10.0/win-x64/publish
