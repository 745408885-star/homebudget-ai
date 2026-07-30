import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const waterAndHeatingDefinition = {
  code: "water_and_heating",
  name: "热水饮水",
  icon: "水",
  description: "普通热水器、净水和饮水设备",
  items: [
    { code: "standard_water_heater", name: "普通热水器", base_estimate: 3000 },
    { code: "water_purifier", name: "净水器", base_estimate: 2500 },
    { code: "drinking_water_device", name: "饮水设备", base_estimate: 1200 },
  ],
  questions: [
    {
      key: "existing_hot_water_system",
      label: "已有热水系统",
      type: "select",
      options: [
        { value: "none", label: "没有" },
        { value: "usable", label: "已有且可用" },
        { value: "replace", label: "已有但需更换" },
      ],
      item_codes: ["standard_water_heater"],
    },
    {
      key: "water_heater_replacement_needed",
      label: "本次需要更换热水器",
      type: "boolean",
      item_codes: ["standard_water_heater"],
    },
    { key: "bathroom_count", label: "卫生间数量", type: "number" },
    { key: "resident_count", label: "本模块使用的常住人数", type: "number" },
    {
      key: "drinking_water_demand",
      label: "饮用水关注程度",
      type: "select",
      options: demandOptions,
    },
    {
      key: "professional_installation_allowed",
      label: "允许专业安装",
      type: "boolean",
      advanced: true,
    },
  ],
} satisfies ModuleDefinition;
