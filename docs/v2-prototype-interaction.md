# Phase 6A 第二批：V2 渐进式交互原型

状态：`interactive prototype`
存储：浏览器 `sessionStorage`
正式 V2 API：未接入
正式 Budget Engine V2：未实现

## 1. 访问与流程

V2 是当前默认产品主线，`/` 为基础入口；以下显式路径继续兼容：

```text
/v2/planner/basic
        ↓
/v2/planner/modules
        ↓
/v2/planner/modules/:moduleCode
        ↓
/v2/planner/preview
```

首次页面只要求城市、户型、面积、常住人数、总预算五项。预算模式位于可选折叠区，默认采用 `ceiling`。用户完成基础信息后进入 12 个模块的工作台，可以按任意顺序配置、返回、刷新或先预览临时方案。

修改城市、户型、面积、人数、总预算或预算模式后，已有模块内容不会丢失，但会标记为“需要重新确认”。

## 2. 模块清单与快速问题

| 模块 | 项目 | 快速问题 |
|---|---|---|
| furniture | 床架、床垫、沙发、餐桌椅、书桌、成品衣柜 | 使用卧室数、睡眠需求、收纳需求 |
| climate | 分体空调、风扇、加湿器、除湿机 | 空调房间、平均面积、已有数量、使用频率、静音、节能；制热为高级设置 |
| kitchen_appliances | 冰箱、烟机、燃气灶、独立洗碗机、微波炉、小家电包 | 做饭频率、人数、储存需求、烹饪能源、洗碗机需求、已有设备、品牌倾向；尺寸限制为高级设置 |
| laundry | 洗衣机、烘干机、熨烫设备 | 成人数、儿童数、洗衣频率、晾晒条件、烘干需求、已有设备 |
| cleaning | 扫地机器人、吸尘器、洗地机 | 面积、宠物、地面、门槛、清洁频率；自动集尘为高级设置 |
| entertainment | 电视、投影、音响、游戏设备 | 观看频率、观看距离、游戏需求、影音需求、已有设备 |
| water_and_heating | 普通热水器、净水器、饮水设备 | 已有热水系统、是否更换、卫生间数、人数、饮水需求；专业安装为高级设置 |
| network_and_smart | 路由器、Mesh、智能门锁、音箱、照明设备、传感器 | 面积、房间数、远程办公、联网设备数、智能需求、安防需求、房屋用途 |
| curtains_and_lighting | 窗帘、成品灯具 | 有外窗房间数、遮光需求 |
| bedding_and_storage | 床品、入住收纳用品 | 床位数、收纳需求 |
| decoration | 地毯、装饰画、靠垫、绿植 | 装饰需求、是否优先易打理 |
| owned_items | 已有物品集中备注 | 已有物品说明、近期更换说明 |

每个模块都在独立组件目录中；共享的三级表单外壳只负责一致的交互和可访问性，不包含模块业务判断。

## 3. 项目状态

所有采购项目支持：

- `need`：本期需要购买。
- `owned`：已有，本期预算为 0，隐藏该项目配置问题。
- `exclude`：不需要，本期预算为 0，隐藏该项目配置问题。
- `later`：以后再买，本期预算为 0，保留未来参考。
- `optional`：可选，低预算时可优先延后。
- `system_recommend`：依据快速问题推断。

模块页的“本模块不需要”会把模块内项目全部设为 `exclude`，并将模块标记为已完成。娱乐模块选择“不看电视”会立即把电视设为 `exclude`。

## 4. 预算模式 C 契约

输入：

```text
budget_mode: ceiling | full_allocation
upgrade_item_codes: string[]
quality_upgrade_modules: string[]
upgrade_budget_target: integer
reserve_budget_target: integer
```

输出：

```text
allocated_budget
unallocated_budget
upgrade_budget
reserve_budget
```

恒等式：

```text
allocated_budget
+ unallocated_budget
+ upgrade_budget
+ reserve_budget
= total_budget
```

`ceiling` 模式允许 `allocated_budget < total_budget`，且升级与备用金额必须为 0。`full_allocation` 模式的未分配金额必须为 0，结余只能进入明确的升级项目、升级模块或备用资金，禁止平均抬高所有项目预算。

## 5. 原型金额边界

本批页面中的金额只由前端静态基准价和状态生成，用来检验信息架构、状态流转和预算模式展示。页面始终显示：

> 交互原型，尚未接入 Budget Engine V2 正式计算。以下金额不是专业报价。

这部分不写入数据库，不调用 V1 API，也不作为正式预算结果。

## 6. 状态恢复与清理

- 独立存储键：`homebudget-ai:v2-prototype`
- 刷新页面：恢复当前会话进度。
- 返回模块总览：保留所有答案与项目状态。
- 修改基础信息：保留答案并标记需要重新确认。
- 清空数据：二次确认后只删除 V2 存储键并返回基础信息页。

## 7. 验收清单

- 基础页只有五个必填项。
- 12 个模块均可进入，且均有独立组件目录。
- 模块可以整体设为不需要。
- 电视为已有时不再显示电视配置；不看电视时自动排除电视。
- 烘干机设为 `later` 后本期预算为 0。
- 刷新后进度恢复。
- V1 `/` 页面和原 API 保持不变。
- TypeScript strict 与生产构建通过。
- 页面使用局部 CSS Modules，没有单一大型 V2 样式文件。
