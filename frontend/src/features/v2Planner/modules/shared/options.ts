import type { SelectOption } from "../../types";

export const frequencyOptions: readonly SelectOption[] = [
  { value: "rarely", label: "很少" },
  { value: "sometimes", label: "偶尔" },
  { value: "often", label: "经常" },
  { value: "daily", label: "每天" },
];

export const demandOptions: readonly SelectOption[] = [
  { value: "low", label: "基础" },
  { value: "medium", label: "重视" },
  { value: "high", label: "非常重视" },
];
