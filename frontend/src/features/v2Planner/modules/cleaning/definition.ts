import type { ModuleDefinition } from "../../types";
import { frequencyOptions } from "../shared/options";

export const cleaningDefinition = {
  code: "cleaning",
  name: "清洁家电",
  icon: "净",
  description: "扫地机器人、吸尘器和洗地机",
  items: [
    { code: "robot_vacuum", name: "扫地机器人", base_estimate: 2800 },
    { code: "vacuum_cleaner", name: "吸尘器", base_estimate: 1200 },
    { code: "floor_washer", name: "洗地机", base_estimate: 2200 },
  ],
  questions: [
    { key: "area", label: "本模块使用的房屋面积", type: "number" },
    { key: "pet_status", label: "是否养宠物", type: "boolean" },
    {
      key: "floor_type",
      label: "主要地面类型",
      type: "select",
      options: [
        { value: "tile", label: "瓷砖" },
        { value: "wood", label: "木地板" },
        { value: "mixed", label: "混合" },
      ],
    },
    {
      key: "threshold_condition",
      label: "门槛情况",
      type: "select",
      options: [
        { value: "few", label: "较少" },
        { value: "many", label: "较多" },
      ],
    },
    {
      key: "cleaning_frequency",
      label: "清洁频率",
      type: "select",
      options: frequencyOptions,
    },
    {
      key: "auto_dust_collection",
      label: "需要自动集尘/拖地",
      type: "boolean",
      advanced: true,
      item_codes: ["robot_vacuum"],
    },
  ],
} satisfies ModuleDefinition;
