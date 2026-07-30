import type { ModuleDefinition } from "../../types";
import { demandOptions, frequencyOptions } from "../shared/options";

export const laundryDefinition = {
  code: "laundry",
  name: "洗衣护理",
  icon: "洗",
  description: "洗衣、烘干和衣物护理设备",
  items: [
    { code: "washing_machine", name: "洗衣机", base_estimate: 3200 },
    { code: "dryer", name: "烘干机", base_estimate: 4500 },
    { code: "garment_steamer", name: "挂烫机/熨烫设备", base_estimate: 600 },
  ],
  questions: [
    { key: "adult_count", label: "成人数量", type: "number" },
    { key: "child_count", label: "儿童数量", type: "number" },
    {
      key: "laundry_frequency",
      label: "洗衣频率",
      type: "select",
      options: frequencyOptions,
    },
    {
      key: "drying_condition",
      label: "晾晒条件",
      type: "select",
      options: [
        { value: "good", label: "充足" },
        { value: "limited", label: "有限" },
        { value: "none", label: "几乎没有" },
      ],
    },
    {
      key: "dryer_demand",
      label: "烘干需求",
      type: "select",
      options: demandOptions,
      item_codes: ["dryer"],
    },
    {
      key: "owned_laundry_items",
      label: "已有设备情况",
      type: "text",
      placeholder: "例如：已有洗衣机，近期不更换",
    },
  ],
} satisfies ModuleDefinition;
