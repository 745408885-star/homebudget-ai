# AI 家居置办预算规划系统产品需求

## 1. 产品定位

V2 面向已经具备可入住基础条件的住宅，帮助用户根据房屋、家庭成员、已有物品、生活习惯和总预算，生成一套唯一、可解释的家居采购预算方案。

V2 规划对象仅包括：

- 可移动家具
- 家电
- 窗帘与成品灯具
- 床品、入住收纳用品
- 智能设备
- 装饰与绿植

“AI”在 V2 设计中仍指规则、需求识别、数量/规格推断和价值优化，不调用大模型。

## 2. 明确不包含

- 水电、防水、泥瓦、墙面、吊顶、地板施工与施工人工
- 装修公司报价
- 全屋定制柜体
- 中央空调、地暖、新风
- 强依赖柜体、开槽、布线或现场改造的嵌入式家电
- 必须经过专业测量才能形成有效报价的固定系统

旧硬装规则、Budget Engine V1、迁移和历史方案不得删除。它们作为未来硬装模块与回滚能力保留，在 V2 采购规则目录中标记为 inactive。

## 3. 预算模式 C

默认 `ceiling`：总预算是最高支出上限，允许建议采购支出低于总预算，差额作为未分配预算保留，禁止为花满而抬价。

用户可主动选择 `full_allocation`：剩余金额只能进入用户指定的重点升级项目、品质升级模块或备用资金，禁止平均增加所有项目。

```text
ceiling:
allocated_budget + unallocated_budget = total_budget

full_allocation:
allocated_budget + upgrade_budget + reserve_budget = total_budget
unallocated_budget = 0
```

## 4. 核心用户任务

1. 描述房屋、房间和家庭成员。
2. 描述使用习惯与品质偏好。
3. 标记已有、明确不需要或以后再买的物品。
4. 输入可用于家居置办的总预算。
5. 获得包含数量、规格、价格区间、当前分配和原因的单一采购方案。

## 5. 业务不变量

所有模式必须满足：

```text
allocated_budget + upgrade_budget + reserve_budget + unallocated_budget
    = total_budget
sum(有效采购项目.current_budget) = allocated_budget
owned / exclude / later 项目.current_budget = 0
```

系统必须先识别需求、排除项目并推断数量，之后才能分配预算。禁止把固定项目列表按权重直接分完全部预算。

## 6. 渐进式规划流程

1. 首次只填写城市、户型、面积、常住人数和总预算。
2. 进入 12 个品类模块组成的规划工作台。
3. 用户按需进入模块，先选择项目状态，再回答 3-7 个快速问题。
4. 高级设置默认折叠。
5. 用户可随时查看带完整度说明的临时预览。

V2 原型是当前默认产品主线，可从 `/` 或 `/v2/planner/basic` 访问；冻结的 Legacy V1 通过 `/legacy` 保留。

## 7. 结果页目标

- 总预算与分类汇总
- 项目数量和房间分布
- 规格标签
- 推荐价格区间和当前分配
- 推荐原因、警告与安装说明
- 已排除、已有、延后购买项目
- 城市商品、配送、安装和服务价格说明

不得出现理想方案、建议增加预算或硬装项目。

## 8. 数据与价格边界

- 规则价格是内部规划区间，不是商品报价。
- V2 设计使用静态 `product_factor`、`delivery_factor`、`installation_factor`、`service_factor`。
- 旧 `labor_factor`、`material_factor`、`custom_factor` 保留用于历史兼容。
- 未来动态价格来源通过接口注入，不直接耦合 Budget Engine V2。

## 9. 本批交付状态

Phase 6A 第二批交付 V2 前端交互原型。数据库迁移、V2 API 和正式引擎仍不执行；Legacy V1 自 `v0.1.0-alpha.1` 起冻结。

完整设计见 [phase-6a-design.md](./phase-6a-design.md)。
