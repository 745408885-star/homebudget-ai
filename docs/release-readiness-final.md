# v0.1.0-alpha.1 最终发布就绪报告

> 状态更新（2026-07-30）：本报告保留正式发布授权前的就绪快照。产品所有者
> 随后已批准 Apache-2.0 并授权正式发布；当前状态以
> [v0.1.0-alpha.1 发布报告](release-v0.1.0-alpha.1.md)为准。

审计日期：2026-07-30
审计范围：文档命名统一、Legacy V1 冻结、V2 默认入口及相关发布前回归。
执行边界：本轮未提交、推送或打标签，未连接 GitHub，未执行 Alembic
迁移，未修改本机 PostgreSQL 数据，未开发新功能或 Budget Engine V2
正式算法。

## 1. 文档命名规范

`docs` 内 Markdown 文件采用英文小写、短横线分词和 `.md` 扩展名；禁止
空格、下划线、大小写混用和含义不清的缩写。版本号中的点号可以保留。
`docs/README.md` 作为文档索引，按 README 通用命名列为明确例外。仓库根
目录继续保留 `README.md`、`README.en.md`、`CHANGELOG.md`、
`CONTRIBUTING.md` 和 `SECURITY.md` 等开源项目标准文件名。
`.github/PULL_REQUEST_TEMPLATE.md` 也保留 GitHub 识别的模板约定名；本轮
只校验并更新其文档引用，不把平台配置文件套用为 `docs` 命名规则。

当前 `docs` 规模较小，继续保持扁平结构，没有为了分类建立单文件目录。
项目新增零依赖只读检查命令：

```powershell
node scripts/check-docs.mjs
```

该命令同时检查 `docs` 文件名，以及根目录、`docs` 和 `.github` 中 Markdown
文件的相对链接和路径大小写。

## 2. 重命名前后完整映射

本轮先扫描后重命名；规范化结果没有名称冲突，也没有覆盖文件。

| 旧路径 | 新路径 |
| --- | --- |
| `docs/AlgorithmDesign.md` | `docs/algorithm-design.md` |
| `docs/DatabaseDesign.md` | `docs/database-design.md` |
| `docs/Phase6A_Design.md` | `docs/phase-6a-design.md` |
| `docs/PRD.md` | `docs/product-requirements.md` |
| `docs/UserFlow.md` | `docs/user-flow.md` |
| `docs/V2PrototypeInteraction.md` | `docs/v2-prototype-interaction.md` |

除本节作为审计映射保留的纯文本记录外，旧文件名作为链接或代码路径的引用
复查结果为 0。

## 3. 当前 docs 目录树

```text
docs/
├── README.md
├── algorithm-design.md
├── architecture.md
├── audit-v0.1.0-alpha.1.md
├── code-size-inventory.md
├── database-design.md
├── development.md
├── known-limitations.md
├── legacy-policy.md
├── phase-6a-design.md
├── product-requirements.md
├── product-scope.md
├── release-readiness-final.md
├── user-flow.md
└── v2-prototype-interaction.md
```

全部文件符合规则；不存在模糊命名子目录。

## 4. 失效链接检查结果

检查覆盖根目录 Markdown、`docs` 全部 Markdown 和 `.github` 说明文档，共
21 个文件、37 条相对 Markdown 链接。目标缺失、大小写不匹配和越出仓库的
链接均为 0；旧文档名的活动引用为 0。中文和英文 README 的文档入口一致，
均包含文档索引、架构、开发环境、产品范围、已知限制和 Legacy 冻结政策。

## 5. Legacy V1 冻结范围

自 `v0.1.0-alpha.1` 起，下列内容正式冻结：

- `/legacy` 下的旧首页、三步问卷和最终估价页面；
- `frontend/src/pages`、旧问卷组件及其状态管理；
- `POST /api/budget/calculate` 的 V1 兼容流程；
- `backend/app/services/budget_engine.py` 及其 V1 评分、分配和报告模块；
- V1 预算规则、城市系数以及历史兼容响应。

Legacy 保留用于历史兼容、回滚、结果对照和 V2 迁移验证，不再与 V2 并列
发展。完整政策见 [Legacy V1 冻结政策](legacy-policy.md)。

## 6. Legacy 允许和禁止的修改

允许的修改仅限 P0 安全修复、无法启动的阻断修复、严重兼容性修复，以及
迁移到 V2 所必需的最小调整。

禁止新增功能、预算规则、问卷字段、UI 改版、算法优化、数据接口、商品模块，
以及任何会继续消耗 V2 产品资源的竞争性开发。Budget Engine V1 只保留
回滚、对照测试和历史兼容用途。

## 7. 默认入口调整结果

`frontend/src/App.tsx` 现在只把 `/legacy` 交给 Legacy V1；其他路径进入 V2
路由解析。`/` 明确渲染 V2 基础信息页，刷新不会因已有本地状态跳到其他页面。
实现没有引入额外路由依赖，也没有循环跳转。

## 8. Legacy 访问地址

- Legacy V1：`http://127.0.0.1:5173/legacy`

入口和所有 Legacy 页面顶部均显示“Legacy V1（已冻结）”以及“此版本仅用于
历史兼容和结果对照，后续产品开发以 V2 为主。”，并提供返回 V2 的按钮。

## 9. V2 访问地址

- 默认入口：`http://127.0.0.1:5173/`
- 基础信息：`http://127.0.0.1:5173/v2/planner/basic`
- 模块工作台：`http://127.0.0.1:5173/v2/planner/modules`
- 预算预览：`http://127.0.0.1:5173/v2/planner/preview`

V2 页面统一标识为“当前产品主线 · 家居置办预算规划 V2 Alpha”，同时明确
Budget Engine V2 尚未接入，当前金额来自原型估算或实验数据。

## 10. README 更新情况

`README.md` 与 `README.en.md` 已同步说明：

- V2 是当前唯一产品主线，`/` 默认进入 V2；
- Legacy V1 已冻结并从 `/legacy` 访问；
- Budget Engine V1 不再继续产品开发；
- Budget Engine V2 尚未正式完成；
- 当前版本为 Alpha，软件是预算规划工具而非施工合同或最终报价；
- 项目结构明确区分 Legacy 页面、`v2Planner`、冻结的 V1 引擎和 V2 草案。

## 11. 修改文件清单

新增：

- `docs/README.md`
- `docs/legacy-policy.md`
- `docs/release-readiness-final.md`
- `scripts/check-docs.mjs`
- `frontend/src/components/LegacyNotice.tsx`
- `frontend/src/components/LegacyNotice.module.css`

重命名：

- 第 2 节列出的 6 个文档文件。

更新：

- `README.md`
- `README.en.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `docs/architecture.md`
- `docs/known-limitations.md`
- 重命名后的产品、算法、数据库、用户流程和 V2 设计文档
- `frontend/src/App.tsx`
- `frontend/src/features/v2Planner/V2PlannerApp.tsx`
- `frontend/src/features/v2Planner/components/V2Shell.tsx`
- `frontend/src/features/v2Planner/components/V2Shell.module.css`
- `frontend/src/features/v2Planner/pages/BasicInfoPage.tsx`

未移动或删除 Legacy 实现。

## 12. 后端检查结果

| 检查 | 结果 |
| --- | --- |
| Ruff | 通过 |
| mypy | 通过，34 个源文件无问题 |
| Python `compileall` | 通过 |
| pytest | 通过，17 项测试全部通过 |

本轮没有修改预算算法、接口契约或数据库模型。

## 13. 前端检查结果

| 检查 | 结果 |
| --- | --- |
| ESLint | 通过 |
| Prettier `--check` | 通过 |
| TypeScript strict | 通过 |
| Vite 生产构建 | 通过，103 个模块完成构建 |

最终构建产物约为 CSS 28.44 kB、JavaScript 200.05 kB；构建仅写入已被
Git 忽略的 `frontend/dist`。

## 14. 浏览器回归结果

浏览器回归使用项目真实前后端和隔离的临时 SQLite 数据库，不写入本机
PostgreSQL。临时服务和测试文件已在验证后停止并清理。

| 场景 | 结果 |
| --- | --- |
| `/` 默认进入 V2、刷新 | 通过，无白屏 |
| V2 基础信息填写 | 通过 |
| 模块工作台和预算预览直达 | 通过 |
| V2 前进、后退、刷新 | 通过 |
| `/legacy` 访问及冻结说明 | 通过 |
| Legacy 原问卷 | 通过 |
| Legacy V1 真实预算 API | HTTP 200 |
| Legacy 最终估价页 | 正常显示并可刷新 |
| 浏览器应用控制台未处理错误 | 0 |

Legacy 验证输入为杭州、100 ㎡、三室两厅、3 人、每日做饭、高睡眠、中收纳、
低娱乐和 280,000 元预算。结果页显示杭州价格信息和优化提示，27 个预算项
合计严格等于 280,000 元。浏览器前进、后退可在 Legacy 结果和 V2 默认页
之间正常切换。

## 15. 数据库未变更证明

- Windows PostgreSQL 18.4 服务保持 `Running / Automatic`；
- 本轮开始前 Alembic 为 `20260728_0002 (head)`；
- 本轮完成后 Alembic 仍为 `20260728_0002 (head)`；
- 前后只读计数均为 `users=12`、`user_requirements=12`、
  `budget_plans=12`；
- 未运行 `alembic upgrade`、`downgrade`、种子写入、数据库重置或结构变更；
- 浏览器测试写入隔离的临时 SQLite，随后仅删除该临时测试文件。

## 16. 安全扫描结果

Git 候选集合的严格模式扫描结果为：私钥 0、GitHub/OpenAI/AWS/Slack/Google
令牌 0、JWT 0、本机绝对路径 0。8 处凭据形式文本经人工复核，均为
`change-me` / `replace-me` 占位符、环境变量读取或 Compose 环境模板，不含
真实秘密。真实 `.env`、Python 虚拟环境、`node_modules`、构建产物、运行
日志、临时数据库、截图和两份本机 PostgreSQL 恢复脚本继续被 `.gitignore`
排除；忽略类别泄漏到候选集合的数量为 0。

未连接 GitHub、GitLab、云数据库、大模型、MCP 或商品接口。

## 17. Git 首次提交候选文件数量

本报告形成时的最终候选集合为 **193 个未跟踪文件**。仓库当时仍为 0 个提交、0 个已跟踪文件、
0 个暂存文件。已执行 `git add --dry-run .` 预览并复核候选集合；该命令没有
写入暂存区。

## 18. 仍需排除的文件

本轮未发现需要新增排除的候选文件。正式首次提交前仍必须保持以下本地内容
在候选集合之外：

- `.env`
- `backend/.venv` 和其他虚拟环境/缓存
- `frontend/node_modules`、`frontend/dist`
- `.dev-logs`、PID、日志、临时数据库和截图
- `backend/scripts/recover_and_bootstrap_local_postgres.ps1`
- `backend/scripts/restore_local_postgres_service.ps1`

## 19. 当前发布就绪评分

**86 / 100**

文档规范、路由主线、Legacy 冻结、静态检查、自动测试、生产构建和本地浏览器
回归已达到 Alpha 候选水平。本报告形成时的扣分主要来自没有 Git 快照、
许可证尚未获得产品所有者批准，以及 CI 尚未在未来远程仓库实际运行。
其中许可证阻塞已于 2026-07-30 的正式发布授权中解决。

## 20. 最终结论

**NO-GO**

这是本报告形成时的公开发布操作 NO-GO，不是本地功能或质量门禁失败。
当时仓库仍无首个提交且 `LICENSE` 不存在；许可证与正式发布授权已在
2026-07-30 的后续决策中解决，实际发布结果以本报告顶部链接的发布报告为准。

## 21. 发布前仍需要产品所有者确认的事项

1. ~~选择并批准开源许可证。~~ 已完成：Apache-2.0。
2. 人工审阅 193 个首次提交候选文件，尤其是文档、配置和示例数据。
3. 在后续授权阶段创建首个提交，并再次确认没有本地文件进入暂存区。
4. 决定是否接受当前 V2 Alpha 的原型价格免责声明和对外文案。
5. 未来创建远程仓库后运行 CI，并依据远程结果给出最终 GO/NO-GO。
6. 在 Budget Engine V2 正式开发前确认独立的产品规则和验收标准。

本报告完成后暂停；未执行任何 GitHub 发布操作。
