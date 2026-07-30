import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const furnitureDefinition = {
  code: "furniture",
  name: "家具配置",
  icon: "家",
  description: "床、沙发、餐桌和成品收纳家具",
  items: [
    { code: "bed_frame", name: "床架", base_estimate: 3500 },
    { code: "mattress", name: "床垫", base_estimate: 4500 },
    { code: "sofa", name: "沙发", base_estimate: 6000 },
    { code: "dining_set", name: "餐桌椅", base_estimate: 3500 },
    { code: "desk", name: "书桌", base_estimate: 1600 },
    { code: "freestanding_wardrobe", name: "成品衣柜", base_estimate: 3000 },
  ],
  questions: [
    { key: "active_bedrooms", label: "需要配置的卧室数量", type: "number" },
    {
      key: "sleep_demand",
      label: "睡眠重视程度",
      type: "select",
      options: demandOptions,
    },
    {
      key: "storage_demand",
      label: "收纳需求",
      type: "select",
      options: demandOptions,
    },
  ],
} satisfies ModuleDefinition;
