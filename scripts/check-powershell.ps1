[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$scriptFiles = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot "scripts") -Filter "*.ps1" -File)
$failures = @()

foreach ($scriptFile in $scriptFiles) {
    $tokens = $null
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile(
        $scriptFile.FullName,
        [ref]$tokens,
        [ref]$errors
    ) | Out-Null
    if ($errors.Count -gt 0) {
        foreach ($parseError in $errors) {
            $failures += "$($scriptFile.Name):$($parseError.Extent.StartLineNumber) $($parseError.Message)"
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Error ("PowerShell syntax check failed:`n" + ($failures -join "`n"))
    exit 1
}

Write-Host "PowerShell syntax check passed: $($scriptFiles.Count) files."
exit 0
