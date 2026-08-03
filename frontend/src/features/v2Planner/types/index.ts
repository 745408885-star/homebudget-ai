export const BUDGET_MODES = ["ceiling", "full_allocation"] as const;
export type BudgetMode = (typeof BUDGET_MODES)[number];

export const ITEM_STATUSES = [
  "need",
  "owned",
  "exclude",
  "later",
  "optional",
  "system_recommend",
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const MODULE_CODES = [
  "furniture",
  "climate",
  "kitchen_appliances",
  "laundry",
  "cleaning",
  "entertainment",
  "water_and_heating",
  "network_and_smart",
  "curtains_and_lighting",
  "bedding_and_storage",
  "decoration",
  "owned_items",
] as const;
export type ModuleCode = (typeof MODULE_CODES)[number];

export type AnswerValue = string | number | boolean | string[];

export interface V2BasicInfo {
  city: string;
  house_type: string;
  area: string;
  resident_count: string;
  total_budget: string;
  budget_mode: BudgetMode;
  reserve_budget_target: string;
  upgrade_budget_target: string;
}

export interface ModuleProgress {
  completed: boolean;
  skipped: boolean;
  needs_reconfirmation: boolean;
  answers: Record<string, AnswerValue>;
  item_statuses: Record<string, ItemStatus>;
}

export interface V2PlannerState {
  version: 1;
  basic: V2BasicInfo;
  modules: Record<ModuleCode, ModuleProgress>;
  updated_at: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ModuleQuestion {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  placeholder?: string;
  options?: readonly SelectOption[];
  advanced?: boolean;
  item_codes?: readonly string[];
  help?: string;
}

export interface ModuleItemDefinition {
  code: string;
  name: string;
  base_estimate: number;
}

export interface ModuleDefinition {
  code: ModuleCode;
  name: string;
  icon: string;
  description: string;
  items: readonly ModuleItemDefinition[];
  questions: readonly ModuleQuestion[];
}

export interface PrototypeBudgetSummary {
  raw_estimate: number;
  allocated_budget: number;
  unallocated_budget: number;
  upgrade_budget: number;
  reserve_budget: number;
}
