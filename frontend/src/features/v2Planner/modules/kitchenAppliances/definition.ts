import type { ModuleDefinition } from "../../types";
import { demandOptions, frequencyOptions } from "../shared/options";

export const kitchenAppliancesDefinition = {
  code: "kitchen_appliances",
  name: "厨房家电",
  icon: "厨",
  description: "冰箱、烟灶、独立洗碗机和小家电",
  items: [
    { code: "refrigerator", name: "冰箱", base_estimate: 4000 },
    { code: "range_hood", name: "普通油烟机", base_estimate: 2500 },
    { code: "gas_stove", name: "普通燃气灶", base_estimate: 1500 },
    {
      code: "standalone_dishwasher",
      name: "独立式洗碗机",
      base_estimate: 4000,
    },
    { code: "microwave", name: "微波炉", base_estimate: 800 },
    {
      code: "small_kitchen_appliance_package",
      name: "小家电基础包",
      base_estimate: 2000,
    },
  ],
  questions: [
    {
      key: "cooking_frequency",
      label: "做饭频率",
      type: "select",
      options: frequencyOptions,
    },
    { key: "resident_count", label: "本模块使用的常住人数", type: "number" },
    {
      key: "food_storage_demand",
      label: "食材储存需求",
      type: "select",
      options: demandOptions,
      item_codes: ["refrigerator"],
    },
    {
      key: "cooking_energy_type",
      label: "烹饪能源",
      type: "select",
      options: [
        { value: "gas", label: "燃气" },
        { value: "electric", label: "电磁/电陶" },
        { value: "unknown", label: "暂不确定" },
      ],
      item_codes: ["gas_stove"],
    },
    {
      key: "dishwasher_demand",
      label: "洗碗机需求",
      type: "select",
      options: demandOptions,
      item_codes: ["standalone_dishwasher"],
    },
    {
      key: "owned_kitchen_items",
      label: "已有设备情况",
      type: "text",
      placeholder: "例如：已有冰箱，可继续使用",
    },
    {
      key: "brand_preference",
      label: "品牌倾向",
      type: "select",
      options: [
        { value: "value", label: "平价实用" },
        { value: "balanced", label: "均衡" },
        { value: "premium", label: "品质优先" },
      ],
    },
    {
      key: "size_limit",
      label: "厨房尺寸限制",
      type: "text",
      advanced: true,
      placeholder: "可选填写",
    },
  ],
} satisfies ModuleDefinition;
