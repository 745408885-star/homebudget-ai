import type { ModuleDefinition } from "../../types";
import { demandOptions, frequencyOptions } from "../shared/options";

export const climateDefinition = {
  code: "climate",
  name: "空气与温控",
  icon: "温",
  description: "分体空调、风扇、加湿与除湿设备",
  items: [
    { code: "split_air_conditioner", name: "普通分体空调", base_estimate: 3500 },
    { code: "fan", name: "风扇", base_estimate: 500 },
    { code: "humidifier", name: "加湿器", base_estimate: 600 },
    { code: "dehumidifier", name: "除湿机", base_estimate: 1800 },
  ],
  questions: [
    {
      key: "conditioned_rooms",
      label: "哪些房间需要空调",
      type: "text",
      placeholder: "例如：客厅、主卧",
      item_codes: ["split_air_conditioner"],
    },
    {
      key: "average_room_area",
      label: "这些房间的平均面积",
      type: "number",
      placeholder: "20",
      item_codes: ["split_air_conditioner"],
    },
    {
      key: "owned_ac_count",
      label: "已有空调数量",
      type: "number",
      placeholder: "0",
      item_codes: ["split_air_conditioner"],
    },
    {
      key: "usage_frequency",
      label: "温控设备使用频率",
      type: "select",
      options: frequencyOptions,
    },
    {
      key: "quietness_demand",
      label: "静音需求",
      type: "select",
      options: demandOptions,
    },
    {
      key: "energy_saving_demand",
      label: "节能需求",
      type: "select",
      options: demandOptions,
    },
    {
      key: "heating_needed",
      label: "是否需要重点制热",
      type: "boolean",
      advanced: true,
    },
  ],
} satisfies ModuleDefinition;
