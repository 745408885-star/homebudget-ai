import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const beddingAndStorageDefinition = {
  code: "bedding_and_storage",
  name: "床品收纳",
  icon: "收",
  description: "床品与入住收纳基础包",
  items: [
    { code: "bedding", name: "床品", base_estimate: 4000 },
    {
      code: "move_in_storage_supplies",
      name: "入住收纳用品",
      base_estimate: 2000,
    },
  ],
  questions: [
    { key: "active_bed_count", label: "需要配置的床位数", type: "number" },
    {
      key: "storage_demand",
      label: "收纳需求",
      type: "select",
      options: demandOptions,
    },
  ],
} satisfies ModuleDefinition;
