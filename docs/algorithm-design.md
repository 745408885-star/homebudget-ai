# Budget Engine V1 算法设计

> 冻结状态：自 `v0.1.0-alpha.1` 起，本引擎仅用于历史兼容、回滚和对照测试。

## 1. 输入

- 用户需求 `UserInput`
- 数据库中的启用预算项目
- 数据库中的城市价格系数

引擎不直接访问文件或数据库，所有依赖通过构造函数传入，便于测试和版本控制。

## 2. 单一方案

V1 只返回 `current_plan`。不再返回 `ideal_plan` 和 `difference_analysis`。

引擎内部仍计算“规则建议目标总额”，它只用于判断预算是否紧张、决定削减顺序和生成警告，不作为第二套方案返回。

## 3. 价值分

```text
value_score =
    frequency × 30%
  + health_impact × 30%
  + lifecycle × 25%
  + preference × 15%
```

- `frequency`：规则权重及生活频率修正
- `health_impact`：防水、水电、床垫等健康安全项目具有更高分
- `lifecycle`：隐蔽工程与固定工程具有更高分
- `preference`：睡眠、做饭、收纳、娱乐、家庭人数和愿意降低项

## 4. 城市系数

面积系数与城市系数共同作用于建议金额：

- 基础施工、水电、厨卫：`labor_factor × 60% + material_factor × 40%`
- 全屋定制：`custom_factor`
- 家具、家电、软装：`material_factor`
- 备用金：不使用城市价格系数

城市未命中时使用全国默认系数并增加 `optimization_warnings`。

## 5. 预算分配

1. 对每个项目计算目标金额，并限制在最低与最高预算之间。
2. 汇总目标金额。
3. 总预算低于目标时，按价值分升序削减，最低预算不可突破。
4. 总预算高于目标时，按价值分降序追加，最高预算不可突破。
5. 所有金额使用整数元，循环结束后执行预算守恒断言。

## 6. 输出

- `feasible`
- `current_plan`
- `optimization_suggestions`
- `optimization_warnings`
- `plan_id`（持久化成功后）

## 7. 警告规则

- 总预算低于内部建议目标
- 一个或多个项目已降至最低预算
- 城市使用全国默认系数
- 总预算接近绝对最低可执行值

## 8. 不变量

```text
sum(current_plan.items.amount) == user_input.total_budget
minimum_budget <= item.amount <= maximum_budget
```

低于全部最低值之和或高于全部最高值之和时返回 422，不生成违反约束的结果。

## 9. Phase 6A 说明

本文件前八节是需要保留的旧 Budget Engine V1 设计。新的家居采购 Budget Engine V2 不覆盖本实现，接口草案位于 `backend/app/services/budget_engine_v2.py`，完整流程见 `docs/phase-6a-design.md`。

V2 的关键变化是先识别需求并推断数量/规格，再计算价格区间和分配预算；不得继续使用固定项目列表直接调权分钱。
