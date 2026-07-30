import type { ModuleDefinition } from "../../types";
import { demandOptions } from "../shared/options";

export const decorationDefinition = {
  code: "decoration",
  name: "装饰绿植",
  icon: "饰",
  description: "地毯、装饰画、靠垫和绿植",
  items: [
    { code: "rug", name: "地毯", base_estimate: 1000 },
    { code: "wall_art", name: "装饰画", base_estimate: 800 },
    { code: "cushions", name: "靠垫", base_estimate: 600 },
    { code: "plants", name: "绿植", base_estimate: 800 },
  ],
  questions: [
    {
      key: "appearance_demand",
      label: "外观装饰需求",
      type: "select",
      options: demandOptions,
    },
    { key: "easy_care_needed", label: "优先易打理", type: "boolean" },
  ],
} satisfies ModuleDefinition;
