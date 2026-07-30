# v0.1.0-alpha.1 GitHub Alpha 发布报告

发布日期：2026-07-30
发布类型：Pre-release / Alpha Technical Preview
默认分支：`main`

> 本文主体在创建 Release 前准备，并在首次推送 CI 通过后补齐远程信息。
> 标签必须指向包含本报告最终版本的提交。

## 1. GitHub 仓库地址

[https://github.com/745408885-star/homebudget-ai](https://github.com/745408885-star/homebudget-ai)

仓库已验证为 Public，创建前同名仓库检查结果为不存在。

## 2. GitHub 账号或组织名称

`745408885-star`

`gh auth status` 已验证账号有效，具备 `repo` 和 `workflow` 权限；报告未记录
认证令牌。

## 3. main 分支地址

[main](https://github.com/745408885-star/homebudget-ai/tree/main)

GitHub 默认分支已验证为 `main`。

## 4. 首次 commit hash

[`e751dd106e7825fdc17ab4313a9a87810ee60768`](https://github.com/745408885-star/homebudget-ai/commit/e751dd106e7825fdc17ab4313a9a87810ee60768)

提交信息：`chore: prepare v0.1.0-alpha.1 release`

## 5. 首次提交文件数量

最终候选共 **195 个文件**，已逐一通过互斥分类规则覆盖：

| 分类 | 数量 | 范围摘要 |
| --- | ---: | --- |
| 正式提交 | 79 | 工程配置、文档、数据库基础、启动脚本和共享代码 |
| 实验性但允许进入 Alpha | 74 | V2 模块化 UI、V2 schema、拆分的采购规则及契约测试 |
| Legacy 冻结代码 | 39 | V1 问卷、页面、API、预算引擎、规则与回归测试 |
| 草案文件 | 3 | V2 Alembic 草案、V2 引擎草案、V2 规则旧草案 |
| 必须排除 | 0 | 本地文件已由 `.gitignore` 排除，不在 195 个候选中 |

三个草案文件为：

- `backend/alembic/drafts/20260729_0003_phase6a_v2_schema.py`
- `backend/app/services/budget_engine_v2.py`
- `backend/data/procurement_rules_v1.draft.json`

分类总数和候选文件唯一数均为 195，没有未分类或重复路径。

## 6. GitHub Actions 运行地址

- 首次发布候选 CI：
  [run 30516017409](https://github.com/745408885-star/homebudget-ai/actions/runs/30516017409)
- 仓库 Actions：
  [GitHub Actions](https://github.com/745408885-star/homebudget-ai/actions)

## 7. 所有 CI 状态

| 检查 | 本地状态 | GitHub Actions 状态 |
| --- | --- | --- |
| Backend Ruff | 通过 | success |
| Backend mypy | 通过 | success |
| Backend dependency audit | 通过 | success |
| Backend pytest | 17 passed | success |
| Frontend ESLint / Prettier | 通过 | success |
| Frontend TypeScript strict | 通过 | success |
| Frontend production build | 通过 | success |
| V2 浏览器回归 | 通过 | 不适用（人工本地回归） |
| Legacy V1 浏览器/API 回归 | HTTP 200，27 项合计 280,000 元 | 不适用（人工本地回归） |

首次提交对应的 backend 和 frontend job 均为 `success`。本报告提交仍须在创建
标签前再次通过相同 CI。

浏览器回归覆盖 `/`、基础信息、模块工作台、家具/温控/厨房三个模块、预算
预览、刷新恢复、`/legacy` 冻结说明和完整 V1 问卷；没有捕获到未处理页面
错误。Alembic 在回归和全部门禁后仍为 `20260728_0002 (head)`，未执行迁移。

## 8. tag 地址

[v0.1.0-alpha.1](https://github.com/745408885-star/homebudget-ai/releases/tag/v0.1.0-alpha.1)

该带说明标签只会在包含本报告的提交通过 CI 后创建。

## 9. Release 地址

[v0.1.0-alpha.1 — Alpha Technical Preview](https://github.com/745408885-star/homebudget-ai/releases/tag/v0.1.0-alpha.1)

## 10. LICENSE 状态

- 许可证：Apache License 2.0
- SPDX：`Apache-2.0`
- 根文件：`LICENSE`
- 正文：与 Apache 官方 `LICENSE-2.0.txt` 规范化内容一致
- 规范化 SHA-256：
  `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`
- `NOTICE`：当前源码候选没有需要创建项目级 `NOTICE` 的证据
- 前端和 Python 项目元数据已统一声明 `Apache-2.0`

## 11. Release 是否标记 Pre-release

是。Release 使用 GitHub Pre-release 标记，不上传额外二进制附件，仅使用
GitHub 自动生成的源码归档。

## 12. 最终安全扫描结果

195 个候选文件的发布前扫描结果：

- 私钥、GitHub/OpenAI/AWS/Slack/Google Token、API 密钥和 JWT：0；
- 本机 Windows/macOS/Linux 用户绝对路径：0；
- 超过 1 MiB 的候选文件：0；
- 数据库、备份、安装包、压缩包、证书和私钥扩展名候选：0；
- 6 个凭据形式文件经人工复核，均为 `change-me` / `replace-me` 占位符、
  环境变量读取或 Compose 必填环境模板，真实秘密为 0；
- `.env.example` 已进入候选且只含占位符，真实 `.env` 未进入候选；
- 被 `.gitignore` 排除的类别泄漏到候选集合：0。

## 13. 被排除文件摘要

以下类别不会进入发布：

- `.env`、本机认证信息和真实数据库连接秘密；
- `backend/.venv`、`node_modules`、`dist` 和各类工具缓存；
- 日志、PID、临时数据库、数据库备份和浏览器截图；
- 本机 PostgreSQL 恢复脚本、安装程序、离线包和个人 IDE 配置。

## 14. 本地工作区最终状态

目标发布提交推送后，本地 `main` 与 `origin/main` 同步；工作区、暂存区均
保持干净。项目启动产生的 `.dev-logs`、`.dev-pids.json` 和构建产物保持
Git 忽略。

## 15. 是否存在未推送修改

否。最终状态要求 0 个未提交修改、0 个未推送提交。

## 16. 发布过程中遇到的问题

可移植性审计发现 `postgres:18-alpine` 的命名卷仍使用 PostgreSQL 17 及
以前的挂载目标。依据 Docker 官方 PostgreSQL 18 镜像说明，已把目标从
`/var/lib/postgresql/data` 修正为 `/var/lib/postgresql`。本机没有运行
Docker Compose，本次没有迁移或改写任何数据库数据。

启动脚本审计还发现 Vite 入口参数在仓库路径包含空格时缺少显式引号；已在
`scripts/start-dev.ps1` 中完成最小引号修正，不改变进程管理或服务配置。

首次暂存检查发现 11 处 Markdown 行尾空格，已在提交前修复并重新通过
`git diff --cached --check`。GitHub OAuth 首次交换发生网络超时，第二次
凭据无效；清理无效凭据并重新登录后认证通过。没有覆盖仓库、强推或绕过 CI。

当前没有未解决的发布阻塞。任何后续 CI、标签或 Release 验证失败都会立即
停止并保留失败记录。

## 17. 最终结论

**RELEASED**

本结论仅在包含本报告的 `main` 提交通过 CI、签注标签和 Pre-release 均创建
成功，且第 14、15 节最终状态复核无误后生效。

## 18. 下一版本建议目标

1. 在独立产品规则和验收标准确认后实现 Budget Engine V2。
2. 将人工浏览器回归逐步转为仓库内自动化 E2E。
3. 增加 CI PostgreSQL 集成测试，同时保留 SQLite 快速测试。
4. 校准商品、配送和有限安装价格数据。
5. 设计 V2 方案历史与用户数据持久化，但不扩大硬装施工范围。

当前版本仍是预算规划 Alpha，不是最终采购报价或合同报价工具。
