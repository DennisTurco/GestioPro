# analyze.ps1 - Local code quality analysis for GestioPro (.NET)
# Usage: ./analyze.ps1

$ErrorActionPreference = 'Continue'

function Write-Step($n, $total, $msg) { Write-Host "`n[$n/$total] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  [XX] $msg" -ForegroundColor Red }

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "     GestioPro - Code Quality Analysis     " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# --- 1. Build + Roslyn Analyzer Warnings ---
Write-Step 1 4 "Build + Roslyn Analyzer Warnings"
$buildOutput = & dotnet build GestioPro.slnx -c Release 2>&1
$buildOutput | Out-File ".build-output.txt" -Encoding utf8
if ($LASTEXITCODE -eq 0) { Write-Ok "Build OK" } else { Write-Fail "Build failed" }

# --- 2. Tests + Coverage (Coverlet / Cobertura) ---
Write-Step 2 4 "Tests + Coverage (Coverlet)"
if (Test-Path "./coverage") { Remove-Item "./coverage" -Recurse -Force }
& dotnet test GestioPro.slnx `
    --collect:"XPlat Code Coverage" `
    --results-directory ./coverage `
    --logger "console;verbosity=minimal"
if ($LASTEXITCODE -eq 0) { Write-Ok "All tests passed" } else { Write-Warn "Some tests failed" }

# --- 3. Code Format Check ---
Write-Step 3 4 "Code Format Check (dotnet format)"
$formatOutput = & dotnet format GestioPro.slnx --verify-no-changes 2>&1
$formatExitCode = $LASTEXITCODE
$formatOutput | Out-File ".format-output.txt" -Encoding utf8
if ($formatExitCode -eq 0) { Write-Ok "Format OK" } else { Write-Warn "Formatting issues found - run: dotnet format GestioPro.slnx" }

# --- 4. Security Audit (NuGet Vulnerability Scan) ---
Write-Step 4 4 "Security Audit (NuGet Vulnerabilities)"
$auditOutput = & dotnet list GestioPro.slnx package --vulnerable --include-transitive 2>&1
$auditOutput | Out-File ".audit-output.txt" -Encoding utf8
if ($LASTEXITCODE -eq 0) { Write-Ok "Audit completed" } else { Write-Warn "Audit check had issues" }

# --- Summary ---
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "   Results Summary" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# Coverage (parse Cobertura XML)
$coberturaFile = Get-ChildItem -Path "./coverage" -Recurse -Filter "coverage.cobertura.xml" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($coberturaFile) {
    [xml]$xml     = Get-Content $coberturaFile.FullName
    $lineRate      = [double]$xml.coverage.'line-rate'
    $branchRate    = [double]$xml.coverage.'branch-rate'
    $linesCovered  = [int]$xml.coverage.'lines-covered'
    $linesValid    = [int]$xml.coverage.'lines-valid'
    $linePct       = [math]::Round($lineRate * 100)
    $branchPct     = [math]::Round($branchRate * 100)
    $icon  = if ($linePct -ge 80) { "[OK]" } elseif ($linePct -ge 60) { "[!!]" } else { "[XX]" }
    $color = if ($linePct -ge 80) { "Green" } elseif ($linePct -ge 60) { "Yellow" } else { "Red" }
    Write-Host "  $icon Test Coverage  : Lines $linePct% ($linesCovered/$linesValid) - Branches $branchPct%" -ForegroundColor $color
} else {
    Write-Host "  [--] Test Coverage  : no data" -ForegroundColor DarkGray
}

# Roslyn analyzer warnings
if (Test-Path ".build-output.txt") {
    $warnLines = Get-Content ".build-output.txt" | Where-Object { $_ -match "\bwarning\s+(CS|CA|IDE|NU|SA)\d+" }
    $warnCount = ($warnLines | Measure-Object).Count
    $icon  = if ($warnCount -eq 0) { "[OK]" } elseif ($warnCount -lt 10) { "[!!]" } else { "[XX]" }
    $color = if ($warnCount -eq 0) { "Green" } elseif ($warnCount -lt 10) { "Yellow" } else { "Red" }
    Write-Host "  $icon Analyzer Warns : $warnCount build warning(s)" -ForegroundColor $color
    Remove-Item ".build-output.txt" -Force
} else {
    Write-Host "  [--] Analyzer Warns : no data" -ForegroundColor DarkGray
}

# Format check
$icon  = if ($formatExitCode -eq 0) { "[OK]" } else { "[!!]" }
$color = if ($formatExitCode -eq 0) { "Green" } else { "Yellow" }
$msg   = if ($formatExitCode -eq 0) { "No formatting issues" } else { "Run: dotnet format GestioPro.slnx" }
Write-Host "  $icon Code Format    : $msg" -ForegroundColor $color
Remove-Item ".format-output.txt" -Force -ErrorAction SilentlyContinue

# Security audit
if (Test-Path ".audit-output.txt") {
    $auditText   = Get-Content ".audit-output.txt" -Raw
    $hasCritical = $auditText -imatch "Critical"
    $hasHigh     = $auditText -imatch "\bHigh\b"
    $hasModerate = $auditText -imatch "Moderate"
    $hasLow      = $auditText -imatch "\bLow\b"
    $hasVulns    = $hasCritical -or $hasHigh -or $hasModerate -or $hasLow
    if ($hasVulns) {
        $critical = ([regex]::Matches($auditText, "(?i)Critical")).Count
        $high     = ([regex]::Matches($auditText, "(?i)\bHigh\b")).Count
        $moderate = ([regex]::Matches($auditText, "(?i)Moderate")).Count
        $low      = ([regex]::Matches($auditText, "(?i)\bLow\b")).Count
        $icon  = if ($hasCritical -or $hasHigh) { "[XX]" } else { "[!!]" }
        $color = if ($hasCritical -or $hasHigh) { "Red" } else { "Yellow" }
        Write-Host "  $icon NuGet Security : vulnerabilities found (Critical: $critical  High: $high  Moderate: $moderate  Low: $low)" -ForegroundColor $color
    } else {
        Write-Host "  [OK] NuGet Security : No known vulnerabilities" -ForegroundColor Green
    }
    Remove-Item ".audit-output.txt" -Force
} else {
    Write-Host "  [--] NuGet Security : no data" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Open reports:" -ForegroundColor DarkGray
if ($coberturaFile) {
    Write-Host "  Coverage : Start-Process '$($coberturaFile.FullName)'" -ForegroundColor White
    Write-Host "             (install ReportGenerator for HTML: dotnet tool install -g dotnet-reportgenerator-globaltool)" -ForegroundColor DarkGray
} else {
    Write-Host "  Coverage : (not generated)" -ForegroundColor DarkGray
}
Write-Host "  Format   : dotnet format GestioPro.slnx" -ForegroundColor White
Write-Host ""
