import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const networkAndSmartDefinition = {
  code: "network_and_smart",
  name: "网络智能",
  icon: "智",
  description: "网络覆盖、门锁和基础智能设备",
  items: [
    { code: "router", name: "路由器", base_estimate: 800 },
    { code: "mesh_node", name: "Mesh 节点", base_estimate: 600 },
    { code: "smart_lock", name: "智能门锁", base_estimate: 1800 },
    { code: "smart_speaker", name: "智能音箱", base_estimate: 500 },
    { code: "smart_lighting_device", name: "智能照明设备", base_estimate: 1200 },
    { code: "basic_sensor_package", name: "基础传感器", base_estimate: 800 },
  ],
  questions: [
    { key: "area", label: "本模块使用的房屋面积", type: "number" },
    { key: "room_count", label: "需要网络覆盖的房间数", type: "number" },
    {
      key: "remote_work_demand",
      label: "远程办公需求",
      type: "select",
      options: demandOptions,
    },
    {
      key: "connected_device_level",
      label: "联网设备数量",
      type: "select",
      options: [
        { value: "low", label: "10台以内" },
        { value: "medium", label: "10-30台" },
        { value: "high", label: "30台以上" },
      ],
    },
    {
      key: "smart_home_demand",
      label: "智能化需求",
      type: "select",
      options: demandOptions,
    },
    {
      key: "security_demand",
      label: "安防需求",
      type: "select",
      options: demandOptions,
    },
    {
      key: "usage_type",
      label: "房屋用途",
      type: "select",
      options: [
        { value: "self_use", label: "自住" },
        { value: "rental", label: "出租" },
        { value: "temporary", label: "临时居住" },
      ],
    },
  ],
} satisfies ModuleDefinition;
