# analyze.ps1 - Local code quality analysis for GestioPro (.NET)
# Usage: ./analyze.ps1                  full analysis
#        ./analyze.ps1 -Changed         only .cs files changed vs master (branch commits + uncommitted + untracked)
#        ./analyze.ps1 -Changed -Base origin/develop
#        ./analyze.ps1 -Changed -MinCoverage 60 -Open
# In -Changed mode build, tests and NuGet audit still run on the whole solution;
# warnings, format and coverage are restricted to the changed files.
# Exit code 1 if: the build fails, tests fail, High/Critical NuGet vulnerabilities are found,
# line coverage is below -MinCoverage (if set), or - in -Changed mode only - the changed
# files have build warnings or formatting issues.

param(
    [switch]$Changed,
    [string]$Base = "master",
    [ValidateRange(0, 100)][int]$MinCoverage = 0,
    [switch]$Open
)

$ErrorActionPreference = 'Continue'

function Write-Step($n, $total, $msg) { Write-Host "`n[$n/$total] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  [XX] $msg" -ForegroundColor Red }

$outDir     = "./coverage"
$warnFile   = "$outDir/analyzer-warnings.txt"
$formatFile = "$outDir/format-issues.txt"
$auditFile  = "$outDir/nuget-audit.txt"
$reportDir  = "$outDir/report"

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "     GestioPro - Code Quality Analysis     " -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
New-Item -ItemType Directory -Force $outDir | Out-Null

# --- Changed files (-Changed) ---
$changedFiles = @()   # repo-relative paths, forward slashes
if ($Changed) {
    $mergeBase = & git merge-base HEAD $Base 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $mergeBase) {
        Write-Fail "Cannot find merge-base with '$Base' - use -Base <branch>"
        exit 1
    }
    $changedFiles = @(
        & git diff --name-only --diff-filter=d $mergeBase   # branch commits + uncommitted (staged and not)
        & git ls-files --others --exclude-standard           # untracked
    ) | Where-Object { $_ -like "*.cs" -and $_ -notmatch "(^|/)Migrations/" -and (Test-Path $_) } | Sort-Object -Unique
    Write-Host "`nMode: changed files vs $Base ($($mergeBase.Substring(0, 8))) - $($changedFiles.Count) .cs file(s)" -ForegroundColor Cyan
    $changedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}
$changedFullPaths = @($changedFiles | ForEach-Object { [System.IO.Path]::GetFullPath($_) })

# --- 1. Build + Roslyn Analyzer Warnings ---
# --no-incremental forces a full rebuild, otherwise up-to-date projects emit no warnings
Write-Step 1 4 "Build + Roslyn Analyzer Warnings"
$buildOutput = & dotnet build GestioPro.slnx -c Release --no-incremental 2>&1
$buildExitCode = $LASTEXITCODE
if ($buildExitCode -eq 0) { Write-Ok "Build OK" } else { Write-Fail "Build failed" }

# --- 2. Tests + Coverage (Coverlet / Cobertura) ---
# Reuses the Release build from step 1; EF migrations are generated code, so excluded from coverage
Write-Step 2 4 "Tests + Coverage (Coverlet)"
& dotnet test GestioPro.slnx -c Release --no-build `
    --collect:"XPlat Code Coverage" `
    --results-directory $outDir `
    --logger "console;verbosity=minimal" `
    -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.ExcludeByFile="**/Migrations/*.cs"
$testExitCode = $LASTEXITCODE
if ($testExitCode -eq 0) { Write-Ok "All tests passed" } else { Write-Fail "Some tests failed" }

# --- 3. Code Format Check ---
Write-Step 3 4 "Code Format Check (dotnet format)"
$formatArgs = @("format", "GestioPro.slnx", "--verify-no-changes")
if ($Changed) { $formatArgs += @("--include") + $changedFiles }
if ($Changed -and $changedFiles.Count -eq 0) {
    $formatOutput = @(); $formatExitCode = 0
} else {
    $formatOutput = & dotnet @formatArgs 2>&1
    $formatExitCode = $LASTEXITCODE
}
if ($formatExitCode -eq 0) {
    Write-Ok "Format OK"
} else {
    $formatOutput | Out-File $formatFile -Encoding utf8
    Write-Warn "Formatting issues found - run: dotnet $(($formatArgs | Where-Object { $_ -ne '--verify-no-changes' }) -join ' ')"
}

# --- 4. Security Audit (NuGet Vulnerability Scan) ---
Write-Step 4 4 "Security Audit (NuGet Vulnerabilities)"
$auditOutput = & dotnet list GestioPro.slnx package --vulnerable --include-transitive 2>&1
$auditOutput | Out-File $auditFile -Encoding utf8
if ($LASTEXITCODE -eq 0) { Write-Ok "Audit completed" } else { Write-Warn "Audit check had issues" }

# --- Summary ---
Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "   Results Summary" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# Coverage: merge every test project's Cobertura file
$coberturaFiles = @(Get-ChildItem -Path $outDir -Recurse -Filter "coverage.cobertura.xml" -ErrorAction SilentlyContinue)
$hasReportGenerator = [bool](Get-Command reportgenerator -ErrorAction SilentlyContinue)
$coverage = $null
if ($Changed -and $changedFiles.Count -eq 0) {
    $coberturaFiles = @()   # nothing changed, nothing to report
}
if ($coberturaFiles.Count -gt 0 -and $hasReportGenerator) {
    $rgArgs = @("-reports:$outDir/**/coverage.cobertura.xml", "-targetdir:$reportDir", "-reporttypes:Html;JsonSummary", "-verbosity:Warning")
    if ($Changed) { $rgArgs += "-filefilters:" + (($changedFullPaths | ForEach-Object { "+$_" }) -join ";") }
    & reportgenerator @rgArgs
    $summaryFile = "$reportDir/Summary.json"
    if (Test-Path $summaryFile) {
        $s = (Get-Content $summaryFile -Raw | ConvertFrom-Json).summary
        $coverage = @{
            LinePct = [math]::Round([double]$s.linecoverage); Covered = [int]$s.coveredlines; Valid = [int]$s.coverablelines
            BranchPct = if ($null -ne $s.branchcoverage) { [math]::Round([double]$s.branchcoverage) } else { 0 }
        }
    }
}
if (-not $coverage -and $coberturaFiles.Count -gt 0) {
    # Fallback without ReportGenerator: sum the raw totals (approximate if projects overlap)
    $covered = 0; $valid = 0; $bCovered = 0; $bValid = 0
    foreach ($f in $coberturaFiles) {
        [xml]$xml = Get-Content $f.FullName
        if ($Changed) {
            # Sum line hits of the classes living in the changed files (branches not tracked here)
            $sources = @($xml.coverage.sources.source)
            foreach ($cls in $xml.SelectNodes("//class")) {
                $clsPath = ($sources | ForEach-Object { [System.IO.Path]::GetFullPath((Join-Path $_ $cls.filename)) }) |
                    Where-Object { $changedFullPaths -contains $_ } | Select-Object -First 1
                if (-not $clsPath) { continue }
                foreach ($line in $cls.SelectNodes("lines/line")) {
                    $valid++
                    if ([int]$line.hits -gt 0) { $covered++ }
                }
            }
        } else {
            $covered  += [int]$xml.coverage.'lines-covered';    $valid  += [int]$xml.coverage.'lines-valid'
            $bCovered += [int]$xml.coverage.'branches-covered'; $bValid += [int]$xml.coverage.'branches-valid'
        }
    }
    $coverage = @{
        LinePct = if ($valid) { [math]::Round($covered * 100 / $valid) } else { 0 }; Covered = $covered; Valid = $valid
        BranchPct = if ($bValid) { [math]::Round($bCovered * 100 / $bValid) } else { 0 }
    }
}
if ($Changed -and $coverage -and $coverage.Valid -eq 0) {
    Write-Host "  [--] Test Coverage  : no coverable lines in the changed files" -ForegroundColor DarkGray
} elseif ($coverage) {
    $linePct = $coverage.LinePct
    $icon  = if ($linePct -ge 80) { "[OK]" } elseif ($linePct -ge 60) { "[!!]" } else { "[XX]" }
    $color = if ($linePct -ge 80) { "Green" } elseif ($linePct -ge 60) { "Yellow" } else { "Red" }
    Write-Host "  $icon Test Coverage  : Lines $linePct% ($($coverage.Covered)/$($coverage.Valid)) - Branches $($coverage.BranchPct)% - $($coberturaFiles.Count) test project(s)" -ForegroundColor $color
} else {
    Write-Host "  [--] Test Coverage  : no data" -ForegroundColor DarkGray
}

# Roslyn analyzer warnings (dotnet build repeats every warning in its final summary, so dedupe)
$warnLines = @($buildOutput | ForEach-Object { "$_".Trim() } | Where-Object { $_ -match "\bwarning\s+(CS|CA|IDE|NU|SA)\d+" } | Sort-Object -Unique)
if ($Changed) {
    # Keep only "<path>(line,col): warning ..." lines whose path is a changed file
    $warnLines = @($warnLines | Where-Object { $_ -match "^(.+?)\(\d+,\d+\):" -and $changedFullPaths -contains [System.IO.Path]::GetFullPath($Matches[1]) })
}
$warnCount = $warnLines.Count
$warnLines | Out-File $warnFile -Encoding utf8
$icon  = if ($warnCount -eq 0) { "[OK]" } elseif ($warnCount -lt 10) { "[!!]" } else { "[XX]" }
$color = if ($warnCount -eq 0) { "Green" } elseif ($warnCount -lt 10) { "Yellow" } else { "Red" }
Write-Host "  $icon Analyzer Warns : $warnCount build warning(s)" -ForegroundColor $color

# Format check
$icon  = if ($formatExitCode -eq 0) { "[OK]" } else { "[!!]" }
$color = if ($formatExitCode -eq 0) { "Green" } else { "Yellow" }
$msg   = if ($formatExitCode -eq 0) { "No formatting issues" } else { "Run: dotnet format GestioPro.slnx" }
Write-Host "  $icon Code Format    : $msg" -ForegroundColor $color

# Security audit: count distinct advisories from the result table ("<Severity>   <advisory url>"),
# since the same advisory repeats per project and in the restore warnings
$auditText  = $auditOutput | Out-String
$advisories = [regex]::Matches($auditText, "\b(Critical|High|Moderate|Low)\s+(https://\S+)") |
    ForEach-Object { [pscustomobject]@{ Severity = $_.Groups[1].Value; Url = $_.Groups[2].Value } } |
    Sort-Object Url -Unique
$critical = @($advisories | Where-Object Severity -eq 'Critical').Count
$high     = @($advisories | Where-Object Severity -eq 'High').Count
$moderate = @($advisories | Where-Object Severity -eq 'Moderate').Count
$low      = @($advisories | Where-Object Severity -eq 'Low').Count
if ($advisories) {
    $icon  = if ($critical -or $high) { "[XX]" } else { "[!!]" }
    $color = if ($critical -or $high) { "Red" } else { "Yellow" }
    Write-Host "  $icon NuGet Security : vulnerabilities found (Critical: $critical  High: $high  Moderate: $moderate  Low: $low)" -ForegroundColor $color
} else {
    Write-Host "  [OK] NuGet Security : No known vulnerabilities" -ForegroundColor Green
}

# --- Reports ---
Write-Host ""
Write-Host "Open reports:" -ForegroundColor DarkGray
$reportIndex = Resolve-Path "$reportDir/index.html" -ErrorAction SilentlyContinue
if ($reportIndex) {
    Write-Host "  Coverage : Start-Process '$reportIndex'" -ForegroundColor White
} elseif ($coberturaFiles.Count -gt 0) {
    Write-Host "  Coverage : $($coberturaFiles[0].FullName)" -ForegroundColor White
    if (-not $hasReportGenerator) {
        Write-Host "             (install ReportGenerator for HTML: dotnet tool install -g dotnet-reportgenerator-globaltool)" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  Coverage : (not generated)" -ForegroundColor DarkGray
}
Write-Host "  Warnings : $(Resolve-Path $warnFile)" -ForegroundColor White
if (Test-Path $formatFile) { Write-Host "  Format   : $(Resolve-Path $formatFile)" -ForegroundColor White }
Write-Host "  Security : $(Resolve-Path $auditFile)" -ForegroundColor White
Write-Host ""

# --- Exit code ---
$failures = @()
if ($buildExitCode -ne 0)   { $failures += "build failed" }
if ($testExitCode -ne 0)    { $failures += "tests failed" }
if ($critical -or $high)    { $failures += "High/Critical vulnerabilities" }
if ($MinCoverage -gt 0 -and $coverage -and $coverage.Valid -gt 0 -and $coverage.LinePct -lt $MinCoverage) {
    $failures += "coverage $($coverage.LinePct)% < $MinCoverage%"
}
if ($Changed -and $warnCount -gt 0)      { $failures += "warnings in changed files" }
if ($Changed -and $formatExitCode -ne 0) { $failures += "formatting issues in changed files" }

if ($Open -and $reportIndex) { Start-Process $reportIndex }

if ($failures) {
    Write-Host "Result: FAILED ($($failures -join ', '))" -ForegroundColor Red
    exit 1
}
Write-Host "Result: PASSED" -ForegroundColor Green
exit 0
