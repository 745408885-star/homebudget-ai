import type { ModuleDefinition } from "../../types";
import { demandOptions, frequencyOptions } from "../shared/options";

export const entertainmentDefinition = {
  code: "entertainment",
  name: "影音娱乐",
  icon: "影",
  description: "电视、投影、音响和游戏设备",
  items: [
    { code: "television", name: "电视", base_estimate: 3500 },
    { code: "projector", name: "投影设备", base_estimate: 4500 },
    { code: "audio_system", name: "音响", base_estimate: 2500 },
    { code: "gaming_equipment", name: "游戏娱乐设备", base_estimate: 4000 },
  ],
  questions: [
    {
      key: "watching_frequency",
      label: "观看电视频率",
      type: "select",
      options: [{ value: "never", label: "不看电视" }, ...frequencyOptions],
      item_codes: ["television"],
    },
    {
      key: "living_room_viewing_distance",
      label: "客厅观看距离（米）",
      type: "number",
      item_codes: ["television"],
    },
    {
      key: "gaming_demand",
      label: "游戏需求",
      type: "select",
      options: demandOptions,
      item_codes: ["gaming_equipment"],
    },
    {
      key: "audio_demand",
      label: "影音体验需求",
      type: "select",
      options: demandOptions,
      item_codes: ["audio_system"],
    },
    {
      key: "owned_entertainment_items",
      label: "已有影音设备",
      type: "text",
      placeholder: "例如：已有电视",
    },
  ],
} satisfies ModuleDefinition;
