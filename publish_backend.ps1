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

# --self-contained false: the target Windows machine must have the matching .NET runtime
# installed. Switch to --self-contained true for a larger installer with no prerequisites.
dotnet publish GestioPro.Api -c Release -r win-x64 --self-contained false -o GestioPro.Api/bin/Release/net10.0/win-x64/publish
