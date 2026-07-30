import { moduleCatalog, moduleOrder } from "../modules/catalog";
import type { ModuleCode, ModuleProgress, V2PlannerState } from "../types";

export const initialBasicInfo = {
  city: "",
  house_type: "",
  area: "",
  resident_count: "",
  total_budget: "",
  budget_mode: "ceiling" as const,
  reserve_budget_target: "0",
  upgrade_budget_target: "0",
};

function createModuleProgress(code: ModuleCode): ModuleProgress {
  return {
    completed: false,
    skipped: false,
    needs_reconfirmation: false,
    answers: {},
    item_statuses: Object.fromEntries(
      moduleCatalog[code].items.map((item) => [item.code, "system_recommend"]),
    ),
  };
}

export function createInitialV2State(): V2PlannerState {
  return {
    version: 1,
    basic: initialBasicInfo,
    modules: Object.fromEntries(
      moduleOrder.map((code) => [code, createModuleProgress(code)]),
    ) as Record<ModuleCode, ModuleProgress>,
    updated_at: new Date().toISOString(),
  };
}
