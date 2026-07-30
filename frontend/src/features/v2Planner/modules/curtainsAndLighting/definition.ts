import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const curtainsAndLightingDefinition = {
  code: "curtains_and_lighting",
  name: "窗帘灯具",
  icon: "光",
  description: "窗帘遮光与成品灯具",
  items: [
    { code: "curtains", name: "窗帘", base_estimate: 5000 },
    { code: "lighting_fixtures", name: "灯具", base_estimate: 5000 },
  ],
  questions: [
    { key: "window_room_count", label: "有外窗的房间数", type: "number" },
    {
      key: "blackout_demand",
      label: "遮光需求",
      type: "select",
      options: demandOptions,
    },
  ],
} satisfies ModuleDefinition;
