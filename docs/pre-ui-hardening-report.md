# Phase 6C：UI 冻结期工程质量优化报告

## 补充：Python 虚拟环境恢复（2026-08-03）

- 旧的 `backend/.venv` 固定引用已不存在的用户级 Python 3.12.10，因此无法启动。
- 系统 Python Launcher 未注册可用解释器；恢复使用 Codex 工作区现有的 Python 3.12.13 创建新的项目内 `backend/.venv`，满足项目 `>=3.12` 与 CI 的 Python 3.12 要求，未安装或修改系统级 Python。
- 依赖完全按照 CI 的现有来源 `backend/requirements-dev.txt` 安装；`pip check` 与 `pip-audit` 均通过。
- 本机遗留 `.ruff_cache`、`.mypy_cache` 与 `.coverage` 均存在访问权限问题。为不删除任何项目缓存，Ruff 使用 `--no-cache`，mypy 与 pytest 使用会后清理的系统临时缓存目录；结果与 CI 的干净缓存环境一致。
- 后端结果：Ruff、mypy、Python 编译均通过；pytest 为 `35 passed, 2 skipped`，覆盖率 88.05%。两个跳过项均为未配置 `TEST_DATABASE_URL` 时的 PostgreSQL 集成测试。
- 前端结果：ESLint、Prettier、TypeScript strict、Vitest（`17 passed`，覆盖率 32.32%）和生产构建均通过。
- 开发数据库记录数在测试前后保持 `budget_items=27`、`city_factors=13`、`users=13`、`user_requirements=13`、`budget_plans=13`；Alembic 保持 `20260728_0002 (head)`，未执行迁移。
- `scripts/start-dev.ps1` 增加了无副作用的 Python/FastAPI/uvicorn 导入探针。检测到失效 venv 时会给出明确中文提示并以非零状态退出，不会自动安装 Python、删除 venv 或升级依赖。
- 新 venv 验证完成后，旧备份 `backend/.venv-broken-20260803` 已删除；新 venv、测试覆盖率、构建产物和缓存均未进入 Git 候选文件。

报告日期：2026-07-30

工作分支：`chore/pre-ui-hardening`（仅本地）

基线版本：`v0.1.0-alpha.1`

## 1. 优化前基线

- 基线提交：`9c8e97cb2cf4ea908bb9616e73d68ef2c058e13b`
- `main`、`origin/main` 和 `v0.1.0-alpha.1` 均指向该提交。
- 基线工作区干净。
- 后端：Ruff、mypy、Python 编译通过，pytest `17 passed`。
- 前端：ESLint、Prettier、TypeScript strict、生产构建通过。
- 基线生产构建：103 个模块，CSS `28.44 kB`，JavaScript `200.05 kB`。
- PostgreSQL：18.4，本机服务自动启动且仅监听 `localhost:5432`。
- Alembic：`20260728_0002 (head)`。
- 开发库基线：
  - `budget_items=27`
  - `city_factors=13`
  - `users=13`
  - `user_requirements=13`
  - `budget_plans=13`
  - 最新方案 ID：`f1b085d4-f8c5-4c0a-a735-1c664d5ae261`
- 基线 CI 仅包含后端静态检查/测试和前端 lint/typecheck/build。
- 基线未设置 `TEST_DATABASE_URL`；数据库相关测试使用 SQLite 内存库，缺少 PostgreSQL 测试库命名保护。

## 2. 已确认的问题

1. pytest 没有在收集阶段阻止开发数据库连接。
2. 单元测试和数据库测试未明确分组，真实 PostgreSQL 集成路径未在 CI 验证。
3. 后端存在带占位密码的默认数据库连接串，缺少必填配置和生产 CORS 校验。
4. 数据库依赖在异常传播时没有统一回滚保护。
5. 启动脚本只检查 PostgreSQL 服务，未验证应用连接是否可用。
6. V2 sessionStorage 没有独立的存储封装版本，字段形状校验不足。
7. `createInitialV2State()` 复用了同一个基础信息对象，存在跨状态污染风险。
8. Legacy API 请求没有超时/取消，快速双击存在极小的重复提交窗口。
9. CI 缺少临时 PostgreSQL、覆盖率、文档链接、PowerShell、敏感信息、代码规模和 Legacy 变更检查。
10. 依赖审计发现并已修复：
    - `glob 10.4.5` CLI 命令注入风险，定向覆盖到 `10.5.0`。
    - `pytest 8.4.2` 的 UNIX 临时目录风险，开发测试工具升级到 `pytest 9.x`。

## 3. 未确认但检查过的问题

- 未发现数据库密码或完整连接串被应用日志输出。
- 未发现 FastAPI 默认向客户端返回内部堆栈。
- 未发现健康检查执行写操作。
- 未发现未关闭的请求级数据库 Session。
- 未发现可通过静态分析和引用搜索安全删除的直接 npm/Python 依赖。
- 未发现明确不可达且可无风险删除的业务代码。
- 未发现 CSS、图标、字体、页面布局或视觉资源变更。
- 未发现 12 个 V2 模块代码变化。
- 未发现文档相对链接失效。
- 未发现候选文件中的私钥、GitHub Token、AWS Key、JWT 或非占位数据库凭据。

## 4. 测试数据库隔离结果

- pytest 启动前把应用 `DATABASE_URL` 强制替换为不可连接的本地 guard URL，单元测试无法回退到根目录 `.env` 中的开发库。
- 所有真实数据库集成测试只读取 `TEST_DATABASE_URL`。
- `TEST_DATABASE_URL` 必须：
  - 使用 PostgreSQL；
  - 数据库名包含 `_test`；
  - 不能是 `homebudget_ai`、`postgres`、`template0` 或 `template1`；
  - 主机只能是 `127.0.0.1`、`localhost` 或 CI 服务名 `postgres`。
- 使用 `homebudget_ai` 执行 pytest 收集时立即以退出码 4 拒绝，未建立连接。
- 本机未设置 `TEST_DATABASE_URL`，因此 2 个 PostgreSQL 集成测试明确跳过；35 个单元/契约测试继续执行。
- GitHub Actions 已配置临时 `homebudget_ci_test` PostgreSQL 18 服务。
- 集成测试通过外层事务回滚测试数据，并在临时测试服务结束时清理测试表。
- 本阶段未创建或修改本机测试数据库。

## 5. API 契约测试结果

### Legacy V1

- `/api/budget/calculate` FastAPI 路由契约返回 HTTP 200。
- 返回 27 个预算项目，金额合计严格等于输入预算。
- `ideal_plan` 不存在。
- `difference_analysis` 不存在。
- 缺失 `optimization_warnings` 时前端解析为 `[]`。
- 内部数据库异常返回受控 503 文案，不泄露连接信息。

### V2

- `budget_mode` 枚举固定为 `ceiling`、`full_allocation`。
- `ceiling` 可保留正数 `unallocated_budget`。
- 两种模式均验证：
  - `allocated_budget`
  - `unallocated_budget`
  - `upgrade_budget`
  - `reserve_budget`
  - 四项合计等于 `total_budget`。
- `owned`、`exclude`、`later` 项目本期预算强制为 0。
- 项目状态枚举固定。
- 12 个模块代码和顺序有显式回归断言。

### OpenAPI

- OpenAPI 可正常生成。
- 保护 `/health`、分类、预算项目和预算计算 4 个核心路径。
- 保护 `UserInput` 和 `BudgetResult` 核心字段。
- 保护已删除旧字段不得意外返回。

## 6. sessionStorage 容错结果

- V2 使用独立 key：`homebudget-ai:v2-prototype`。
- 新存储结构包含显式 `schemaVersion=1`。
- Phase 6A 未封装的 `version=1` 数据会原地迁移。
- 损坏 JSON、未知 schemaVersion、错误字段类型和非法枚举均安全恢复。
- 加载过程只接受 12 个已知模块及其已知项目状态。
- 存储被浏览器禁用或写入超限时，不抛出未捕获异常。
- V2 清空操作只删除 V2 key，不影响 `homebudget-ai:planner` Legacy 数据。
- 修复了初始基础信息对象复用问题。
- 6 个存储专项测试全部通过。

## 7. 配置与错误处理结果

- 新增 `APP_ENV=development|test|production`。
- `DATABASE_URL` 改为必填并校验格式，不再使用带占位密码的运行默认值。
- `.env` 缺失时启动脚本继续提供明确中文提示。
- 启动脚本新增只读 `SELECT 1` 数据库连接检查，失败时返回非 0。
- 生产环境必须显式设置 `CORS_ALLOWED_ORIGINS`，禁止 `*`。
- 开发环境默认只允许本机 Vite 来源。
- 数据库依赖异常时统一回滚并关闭 Session。
- API 数据库异常不向客户端暴露内部错误或密码。
- 健康检查仍只返回状态，不访问或写入数据库。
- 前端预算请求使用 10 秒超时和 AbortController。
- 非 JSON 成功响应、网络异常和超时均转成受控错误。
- 提交流程增加同步 ref 防重复保护。
- 浏览器控制台未处理错误和警告均为 0。

## 8. CI 改进内容

后端：

- PostgreSQL 18 临时测试服务。
- TEST_DATABASE_URL 安全检查。
- Ruff lint/format。
- mypy。
- Python 编译。
- 全部开发依赖漏洞审计。
- pytest 单元、契约、集成测试和覆盖率。

前端：

- `npm ci` 锁文件一致性。
- ESLint 和 Prettier。
- TypeScript strict。
- npm 高危漏洞审计。
- Vitest 与覆盖率。
- 生产构建。

仓库质量：

- Markdown 命名和相对链接。
- 敏感信息扫描。
- 业务文件 400 行 warning 报告。
- Legacy 冻结范围变更 warning。
- PowerShell 脚本语法检查。

代码规模和 Legacy 检查只生成 warning，不阻塞 CI。

## 9. 依赖和死代码清理结果

- `npm ls --depth=0` 无缺失或无效直接依赖。
- `pip check` 通过。
- Python 全部开发依赖审计为 0 个已知漏洞。
- npm 官方审计为 0 个已知漏洞。
- 新增测试依赖：
  - `vitest`
  - `@vitest/coverage-v8`
  - `pytest-cov`
- 安全定向调整：
  - `glob=10.5.0` override；
  - `pytest>=9.0.3,<10.0`，本机验证版本为 9.1.1。
- 未执行大规模依赖升级。
- 未删除无法被充分证明为未使用的代码。

## 10. Legacy 冻结检查

- `/legacy` 可访问并显示“Legacy V1（已冻结）”。
- 冻结说明和返回 V2 入口正常。
- Legacy 首页、问卷入口和 Step 1 正常。
- Legacy 预算算法和规则未修改。
- Legacy 稳定性范围内有 3 个前端文件变更：
  - `frontend/src/api/budget.ts`：超时、取消和异常 JSON 保护；
  - `frontend/src/hooks/useBudgetPlanner.ts`：sessionStorage 异常保护；
  - `frontend/src/pages/planner/usePlannerFlow.ts`：重复提交保护。
- CI 会对上述冻结范围变更生成醒目 warning。
- `docs/legacy-policy.md` 链接和内容保持有效。

## 11. 修改文件清单

配置和 CI：

- `.env.example`
- `.github/workflows/ci.yml`
- `.gitignore`
- `backend/pytest.ini`
- `backend/requirements-dev.txt`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vitest.config.ts`

后端：

- `backend/app/core/config.py`
- `backend/app/core/database_urls.py`
- `backend/app/db/session.py`
- `backend/app/main.py`
- `backend/app/schemas/v2/plans.py`
- `backend/scripts/check_database_connection.py`
- `backend/scripts/check_test_database_safety.py`

后端测试：

- `backend/tests/conftest.py`
- `backend/tests/integration/test_database_integration.py`
- `backend/tests/test_budget_engine.py`
- `backend/tests/test_config.py`
- `backend/tests/test_database_safety.py`
- `backend/tests/test_openapi_contract.py`
- `backend/tests/test_session_management.py`
- `backend/tests/test_v2_design_contracts.py`

前端稳定性与测试：

- `frontend/src/api/budget.ts`
- `frontend/src/api/budget.test.ts`
- `frontend/src/features/v2Planner/modules/catalog.ts`
- `frontend/src/features/v2Planner/state/initialState.ts`
- `frontend/src/features/v2Planner/state/storage.ts`
- `frontend/src/features/v2Planner/state/storage.test.ts`
- `frontend/src/features/v2Planner/types/index.ts`
- `frontend/src/features/v2Planner/utils/estimates.test.ts`
- `frontend/src/hooks/useBudgetPlanner.ts`
- `frontend/src/pages/planner/usePlannerFlow.ts`

仓库脚本与报告：

- `docs/README.md`
- `scripts/check-code-size.mjs`
- `scripts/check-legacy-changes.mjs`
- `scripts/check-powershell.ps1`
- `scripts/check-secrets.mjs`
- `scripts/start-dev.ps1`
- `docs/pre-ui-hardening-report.md`

## 12. 后端检查结果

- Python：3.12.10。
- Ruff lint：通过。
- Ruff format：通过。
- mypy：35 个源码文件通过。
- compileall：通过。
- pytest：`35 passed, 2 skipped`。
- 跳过原因：本机未设置 `TEST_DATABASE_URL`。
- `pip check`：通过。
- `pip-audit requirements-dev.txt`：0 个已知漏洞。
- OpenAPI 和只读 API 实测：
  - `/health`：200，`status=ok`；
  - OpenAPI：4 个核心路径；
  - 分类：8 条；
  - 预算项目：27 条；
  - 本机开发 CORS：只允许 `http://127.0.0.1:5173`。

## 13. 前端检查结果

- Node.js：22.11.0。
- ESLint：通过。
- Prettier：通过。
- TypeScript strict：通过。
- Vitest：3 个文件、17 个测试全部通过。
- 生产构建：104 个模块。
- CSS：`28.44 kB`，文件指纹与基线一致：`index-DsYH0cEr.css`。
- JavaScript：`201.95 kB`，增加约 1.90 kB，来源为存储校验和请求稳定性逻辑。
- npm 官方审计：0 个已知漏洞。

## 14. 数据库未变化证明

优化前后均为：

- `budget_items=27`
- `city_factors=13`
- `users=13`
- `user_requirements=13`
- `budget_plans=13`
- 最新方案 ID：`f1b085d4-f8c5-4c0a-a735-1c664d5ae261`
- 最新方案预算：280000
- Alembic：`20260728_0002 (head)`

本阶段没有执行 Alembic 迁移、结构写入、种子写入、预算计算 POST 或数据库重置。

## 15. UI 未变化证明

- Git diff 中 CSS、图片、图标、字体和视觉资源变更数量为 0。
- 基线和优化后使用相同移动端视口保存截图：
  - V2 基础信息页；
  - V2 模块工作台；
  - V2 预算预览；
  - Legacy 首页。
- V2 基础页、模块工作台、预览页和 Legacy 首页 DOM 快照均与基线一致。
- 前后截图人工对比未发现布局、颜色、字体、间距、卡片或响应式变化。
- CSS 生产构建文件指纹保持不变。
- 浏览器验证：
  - `/` 正常；
  - `/v2/planner/modules` 正常；
  - 家具、温控、厨房三个模块正常；
  - `/v2/planner/preview` 正常；
  - 预览刷新恢复正常；
  - `/legacy` 和问卷入口正常；
  - 控制台错误 0、警告 0。

截图保存在本机忽略目录 `.dev-logs/ui-baseline` 和 `.dev-logs/ui-after`，不会进入 Git 候选文件。

## 16. 当前测试覆盖率报告

- 后端总语句覆盖率：88%。
- 关键后端模块：
  - `budget_engine.py`：90%；
  - `budget_scoring.py`：98%；
  - V2 schema：94%～100%；
  - `database_urls.py`：87%；
  - `config.py`：98%。
- 前端总语句覆盖率：32.32%。
- 关键前端模块：
  - `api/budget.ts`：77.68%；
  - V2 `storage.ts`：92.02%；
  - V2 `estimates.ts`：88.5%；
  - 枚举和模块目录：100%。
- 未设置覆盖率强制门槛。
- 未为提高数字编写无意义 UI 快照测试。

## 17. 尚未解决的问题

1. 本机没有 `TEST_DATABASE_URL`，因此 PostgreSQL 集成测试只完成了安全跳过和危险 URL 拒绝验证。
2. 本阶段禁止 push，新 GitHub Actions 工作流尚未在远端实际运行。
3. 前端整体覆盖率偏低，主要是视觉组件和页面；当前由浏览器回归覆盖，不在 UI 冻结期引入大规模组件测试。
4. `budget_engine_v2.py` 仍是未接入草案，覆盖率为 0，按阶段约束不开发。
5. `glob 10.5.0` 已修复当前公告且审计为 0，但上游已停止维护 10.x；应等待覆盖率工具依赖链自然升级后移除 override。
6. 为保证开发库记录不变，本地浏览器没有再次提交 Legacy 预算 POST；该路径由 FastAPI 契约测试和 CI 临时 PostgreSQL 集成测试保护。

## 18. 风险分级

### 中风险

- 新 CI PostgreSQL 集成测试尚未在 GitHub Actions 真实执行。合并前必须观察一次完整 CI。

### 低风险

- pytest 开发工具从 8.x 升级到安全的 9.x；本地全部测试通过。
- 前端新增 Vitest 使锁文件变化较大，但产品运行依赖和构建输出基本不变。
- 3 个 Legacy 文件包含允许范围内的稳定性修复，需要代码审查确认无功能扩展。
- 前端页面级单元覆盖率仍低。

### 信息

- 业务源码最大文件 246 行，未超过 400 行 warning 警戒线。
- 未修改任何 CSS 或产品文案。

## 19. 是否建议合并到 main

结论：**CONDITIONAL**

满足以下条件后建议合并：

1. 在 Pull Request 或临时审查流程中运行一次新 GitHub Actions。
2. 确认临时 PostgreSQL 的 2 个集成测试通过，不是 skipped。
3. 确认三个 CI job 全部成功。
4. 产品所有者确认 Legacy 的三处稳定性修改符合冻结例外。

当前不建议在未执行上述 CI 的情况下直接合并。

## 20. 完整 git diff 摘要

不含本报告自身：

- 39 个文件；
- 22 个已跟踪文件修改；
- 17 个新文件；
- 新增 2530 行；
- 删除 179 行。

本报告额外新增 1 个 Markdown 文件，因此最终候选共 40 个文件。

主要变化分布：

- 测试数据库隔离和配置安全；
- 后端契约、OpenAPI、事务和错误处理测试；
- 前端 API、sessionStorage 和枚举契约测试；
- CI、覆盖率、敏感信息、代码规模、PowerShell 和 Legacy 检查；
- 依赖安全补丁；
- 文档报告。

未执行：

- git commit
- git push
- Pull Request
- tag
- Release
- Alembic 迁移
- 数据库写入或重置
- UI 重设计
- Budget Engine V2 正式算法开发
