[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot "backend"
$frontendRoot = Join-Path $projectRoot "frontend"
$pythonPath = Join-Path $backendRoot ".venv\Scripts\python.exe"
$viteEntry = Join-Path $frontendRoot "node_modules\vite\bin\vite.js"
$envPath = Join-Path $projectRoot ".env"
$pidFile = Join-Path $projectRoot ".dev-pids.json"
$logRoot = Join-Path $projectRoot ".dev-logs"

function Stop-WithMessage {
    param([string]$Message)
    Write-Host ""
    Write-Host "启动失败：$Message" -ForegroundColor Red
    exit 1
}

function Test-UrlReady {
    param(
        [string]$Url,
        [int]$Attempts = 30
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    }
    return $false
}

function Get-ListenerProcessRecord {
    param(
        [int]$Port,
        [string]$CommandMarker
    )

    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
    if ($listeners.Count -ne 1) {
        throw "端口 $Port 未找到唯一监听进程，无法安全记录项目进程。"
    }
    $process = Get-Process -Id $listeners[0].OwningProcess -ErrorAction Stop
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($process.Id)" -ErrorAction Stop
    if (-not ($processInfo.CommandLine -like "*$CommandMarker*")) {
        throw "端口 $Port 的监听进程与预期项目命令不匹配。"
    }

    return @{
        pid = $process.Id
        executable_path = $process.Path
        start_time = $process.StartTime.ToUniversalTime().ToString("o")
        command_marker = $CommandMarker
    }
}

Write-Host "正在检查 AI 家装预算系统的本地开发环境..." -ForegroundColor Cyan

$postgresServices = @(Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue)
if ($postgresServices.Count -eq 0) {
    Stop-WithMessage "未找到名称以 postgresql 开头的 Windows 服务。请先按 README 安装并初始化 PostgreSQL。"
}
$postgresService = $postgresServices |
    Where-Object { $_.Status -eq "Running" } |
    Select-Object -First 1
if (-not $postgresService) {
    $serviceSummary = ($postgresServices | ForEach-Object { "$($_.Name)=$($_.Status)" }) -join "，"
    Stop-WithMessage "PostgreSQL 服务未运行（$serviceSummary）。本脚本不会修改系统服务，请先手动启动对应服务。"
}
Write-Host "✓ PostgreSQL 服务 $($postgresService.Name) 正在运行" -ForegroundColor Green

if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
    Stop-WithMessage "缺少 $envPath。请从 .env.example 创建本地 .env，并填写 DATABASE_URL。"
}
Write-Host "✓ 已找到本地 .env" -ForegroundColor Green

if (-not (Test-Path -LiteralPath $pythonPath -PathType Leaf)) {
    Stop-WithMessage "缺少 backend/.venv。请先按 README 完成后端依赖准备。"
}
Write-Host "✓ 已找到 backend/.venv" -ForegroundColor Green

if (-not (Test-Path -LiteralPath (Join-Path $frontendRoot "node_modules") -PathType Container)) {
    Stop-WithMessage "缺少 frontend/node_modules。请先在 frontend 目录执行 npm install。"
}
if (-not (Test-Path -LiteralPath $viteEntry -PathType Leaf)) {
    Stop-WithMessage "未找到 Vite 入口文件，请检查 frontend/node_modules 是否完整。"
}
Write-Host "✓ 已找到 frontend/node_modules" -ForegroundColor Green

$nodeCommand = Get-Command "node.exe" -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    Stop-WithMessage "未找到 node.exe，请确认 Node.js 已加入 PATH。"
}

if (Test-Path -LiteralPath $pidFile -PathType Leaf) {
    try {
        $savedProcesses = Get-Content -LiteralPath $pidFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $backendAlive = Get-Process -Id $savedProcesses.backend.pid -ErrorAction SilentlyContinue
        $frontendAlive = Get-Process -Id $savedProcesses.frontend.pid -ErrorAction SilentlyContinue
        if ($backendAlive -or $frontendAlive) {
            Stop-WithMessage "检测到上次由本项目脚本启动的进程仍在运行。请先执行 scripts/stop-dev.ps1。"
        }
    }
    catch {
        Stop-WithMessage ".dev-pids.json 无法读取。请确认没有本项目服务运行后，再手动移走该状态文件。"
    }
}

foreach ($port in 8000, 5173) {
    $listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($listener) {
        Stop-WithMessage "端口 $port 已被进程 $($listener[0].OwningProcess) 占用。本脚本不会停止或覆盖其他进程。"
    }
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

$backendProcess = $null
$frontendProcess = $null
try {
    $backendProcess = Start-Process `
        -FilePath $pythonPath `
        -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000") `
        -WorkingDirectory $backendRoot `
        -RedirectStandardOutput (Join-Path $logRoot "backend.out.log") `
        -RedirectStandardError (Join-Path $logRoot "backend.err.log") `
        -WindowStyle Hidden `
        -PassThru

    if (-not (Test-UrlReady -Url "http://127.0.0.1:8000/health")) {
        throw "FastAPI 未能通过健康检查。请查看 .dev-logs/backend.err.log。"
    }

    $frontendProcess = Start-Process `
        -FilePath $nodeCommand.Source `
        -ArgumentList @("`"$viteEntry`"", "--host", "127.0.0.1", "--port", "5173") `
        -WorkingDirectory $frontendRoot `
        -RedirectStandardOutput (Join-Path $logRoot "frontend.out.log") `
        -RedirectStandardError (Join-Path $logRoot "frontend.err.log") `
        -WindowStyle Hidden `
        -PassThru

    if (-not (Test-UrlReady -Url "http://127.0.0.1:5173/")) {
        throw "Vite 未能通过页面检查。请查看 .dev-logs/frontend.err.log。"
    }

    $state = @{
        backend = Get-ListenerProcessRecord `
            -Port 8000 `
            -CommandMarker "uvicorn app.main:app"
        frontend = Get-ListenerProcessRecord `
            -Port 5173 `
            -CommandMarker "node_modules\vite\bin\vite.js"
    }
    $state | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $pidFile -Encoding UTF8
}
catch {
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
    }
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
    }
    Stop-WithMessage $_.Exception.Message
}

Write-Host ""
Write-Host "启动成功。" -ForegroundColor Green
Write-Host "前端页面：      http://127.0.0.1:5173/"
Write-Host "后端健康检查：  http://127.0.0.1:8000/health"
Write-Host "FastAPI 文档：  http://127.0.0.1:8000/docs"
Write-Host "日志目录：      $logRoot"
Write-Host "停止服务：      .\scripts\stop-dev.ps1"
