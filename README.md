# HomeBudget AI / 住算

> `v0.1.0-alpha.1` Alpha 技术预览

面向中国大陆市场的家居置办预算规划工具。当前主线是 V2 模块化家居
规划；`/` 默认进入 V2。Legacy V1 已正式冻结，仅保留历史兼容、回滚和
结果对照。

本项目帮助用户理解预算可能如何分配，不是装修公司报价、商品报价或
工程选型工具。V2 当前金额来自原型规则或实验数据，尚未接入正式
Budget Engine V2 和真实商品价格。

## 产品边界

V2 规划可移动家具、独立家电、软装、床品、入住收纳和有限安装的智能
设备。

当前不包含：

- 硬装施工；
- 水电、防水、墙面、吊顶和地面工程；
- 全屋定制和固定柜体；
- 装修公司报价；
- 强依赖现场改造的嵌入式设备。

## 当前能力

- V2 Alpha：五项基础信息、12 个独立品类模块、项目状态、会话恢复和
  原型预算预览。
- Legacy V1（已冻结）：三步问卷、城市系数、可解释预算分配和
  PostgreSQL 快照；Budget Engine V1 不再继续产品开发。
- 两种 V2 预算表达：预算上限 `ceiling` 和定向全部分配
  `full_allocation`。
- 本地 PostgreSQL、Alembic、FastAPI、React 和 TypeScript。

## 技术栈

- Frontend: React 18, TypeScript, Vite
- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL
- Quality: ESLint, Prettier, Ruff, mypy, pytest

## 项目结构

```text
frontend/src/pages/                       Legacy V1 页面（已冻结）
frontend/src/features/v2Planner/          V2 当前产品主线
backend/app/services/budget_engine.py     Budget Engine V1 编排（已冻结）
backend/app/services/budget_engine_*.py   V1 评分、分配、报告与类型
backend/app/services/budget_engine_v2.py  V2 未接入的设计接口草案
backend/app/schemas/v2/                   V2 数据契约
backend/data/procurement_rules/           V2 模块化规则草案
```

Legacy 冻结边界及允许修改范围见
[Legacy V1 冻结政策](docs/legacy-policy.md)。

## 首次准备

### 1. 克隆并进入项目

```powershell
git clone <repository-url>
Set-Location homebudget-ai
```

### 2. 准备 PostgreSQL

创建本地开发数据库和最小权限应用用户。数据库应只监听本机地址。

```sql
CREATE USER homebudget_app WITH PASSWORD 'replace-with-a-local-password';
CREATE DATABASE homebudget_ai OWNER homebudget_app;
```

也可以使用仓库中的 `compose.yaml`。Docker 只是可选方案，本项目不要求
为本地开发安装 Docker。

### 3. 配置环境变量

```powershell
Copy-Item .env.example .env
```

只在本地 `.env` 中填写真实密码：

```dotenv
DATABASE_URL=postgresql+psycopg://homebudget_app:replace-me@127.0.0.1:5432/homebudget_ai
POSTGRES_DB=homebudget_ai
POSTGRES_USER=homebudget_app
POSTGRES_PASSWORD=replace-me
```

`.env` 已被 Git 忽略，禁止提交。

### 4. 安装后端依赖

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
python -m alembic upgrade head
Set-Location ..
```

`alembic upgrade head` 只会执行正式 `alembic/versions` 中的迁移。V2 的
Phase 6A 迁移仍位于 `alembic/drafts`，不会被执行。

### 5. 安装前端依赖

```powershell
Set-Location frontend
npm ci
Set-Location ..
```

## 启动

### 一键启动

项目脚本根据自身位置计算项目根目录，不依赖固定盘符：

```powershell
.\scripts\start-dev.ps1
```

脚本不会安装依赖、执行迁移或启动/停止 PostgreSQL。若 PostgreSQL
不可用、`.env` 缺失、依赖缺失或端口被占用，会显示明确错误。

停止本项目启动的前后端：

```powershell
.\scripts\stop-dev.ps1
```

停止脚本只处理 PID 文件中校验通过的 FastAPI 和 Vite 进程，不停止
PostgreSQL 服务或其他进程。

### 手动启动

后端 PowerShell：

```powershell
Set-Location backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

前端 PowerShell：

```powershell
Set-Location frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

## 访问地址

- V2 默认入口: http://127.0.0.1:5173/
- V2 基础信息: http://127.0.0.1:5173/v2/planner/basic
- V2 模块工作台: http://127.0.0.1:5173/v2/planner/modules
- V2 预算预览: http://127.0.0.1:5173/v2/planner/preview
- Legacy V1（已冻结）: http://127.0.0.1:5173/legacy
- 后端健康检查: http://127.0.0.1:8000/health
- FastAPI 文档: http://127.0.0.1:8000/docs

## 质量检查

后端：

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m ruff check app tests scripts
.\.venv\Scripts\python.exe -m ruff format --check app tests scripts
.\.venv\Scripts\python.exe -m mypy app
.\.venv\Scripts\python.exe -m pytest
```

前端：

```powershell
Set-Location frontend
npm run lint
npm run typecheck
npm run build
```

后端测试使用内存 SQLite，不连接开发数据库。CI 不需要本地 PostgreSQL
密码，也不会连接开发数据库。

## 常见问题

- PostgreSQL 不可用：确认服务已启动，且 `.env` 的 `DATABASE_URL`
  正确。
- 端口 8000 或 5173 被占用：停止已有实例或手动选择其他端口；启动
  脚本不会关闭无关进程。
- PowerShell 阻止脚本：可仅对当前窗口使用
  `Set-ExecutionPolicy -Scope Process Bypass`。
- V2 刷新后回到基础页：确认同一浏览器会话的 `sessionStorage` 未被
  清理。

## 已知限制

- Budget Engine V1 已冻结，不再新增功能、规则、字段或算法优化。
- Budget Engine V2 尚未实现和接入。
- V2 不写入正式数据库。
- V2 价格是交互原型估算，不是专业报价。
- V2 迁移草案未批准执行。
- 当前仅针对中国大陆城市和人民币场景。
- 尚未完成可访问性、性能和安全的生产级认证。

详见 [known limitations](docs/known-limitations.md)。

## 路线图

1. `v0.1.0-alpha.1`：公开代码审计、模块化和 CI。
2. Alpha 体验评审：确认模块划分、输入负担和预算模式。
3. Budget Engine V2：规则加载、数量/规格推断和可解释分配。
4. 影子 API 与持久化验证。
5. Beta：价格校准、可访问性、性能和安全加固。

## 文档

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Product scope](docs/product-scope.md)
- [Known limitations](docs/known-limitations.md)
- [Legacy policy](docs/legacy-policy.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## 许可证

本项目采用 [Apache License 2.0](LICENSE)，SPDX 标识为 `Apache-2.0`。
