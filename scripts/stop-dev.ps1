[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $projectRoot ".dev-pids.json"

if (-not (Test-Path -LiteralPath $pidFile -PathType Leaf)) {
    Write-Host "没有找到 .dev-pids.json；当前没有可由本脚本确认并停止的项目进程。" -ForegroundColor Yellow
    exit 0
}

try {
    $state = Get-Content -LiteralPath $pidFile -Raw -Encoding UTF8 | ConvertFrom-Json
}
catch {
    Write-Host "无法读取 .dev-pids.json。为避免停止无关进程，本脚本未执行任何停止操作。" -ForegroundColor Red
    exit 1
}

function Stop-TrackedProcess {
    param(
        [object]$Record,
        [string]$Label
    )

    $process = Get-Process -Id $Record.pid -ErrorAction SilentlyContinue
    if (-not $process) {
        Write-Host "• $Label 已经停止。"
        return $true
    }

    $expectedStart = [DateTime]::Parse($Record.start_time).ToUniversalTime()
    $actualStart = $process.StartTime.ToUniversalTime()
    $sameStart = [Math]::Abs(($actualStart - $expectedStart).TotalSeconds) -lt 1
    $samePath = $process.Path -eq $Record.executable_path
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($Record.pid)" -ErrorAction SilentlyContinue
    $sameCommand = $processInfo -and $processInfo.CommandLine -like "*$($Record.command_marker)*"

    if (-not ($sameStart -and $samePath -and $sameCommand)) {
        Write-Host "• $Label 的 PID 已被其他进程占用；为安全起见未停止该进程。" -ForegroundColor Yellow
        return $false
    }

    Stop-Process -Id $process.Id
    Write-Host "✓ 已停止 $Label（PID $($process.Id)）" -ForegroundColor Green
    return $true
}

$frontendStopped = Stop-TrackedProcess -Record $state.frontend -Label "React/Vite 前端"
$backendStopped = Stop-TrackedProcess -Record $state.backend -Label "FastAPI 后端"

if (-not ($frontendStopped -and $backendStopped)) {
    Write-Host "未能安全确认全部项目进程，已保留 .dev-pids.json 供排查。" -ForegroundColor Red
    exit 1
}

Remove-Item -LiteralPath $pidFile
Write-Host "PostgreSQL 系统服务未被停止。"
