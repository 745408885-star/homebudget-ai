import { moduleCatalog, moduleOrder } from "../modules/catalog";
import type {
  ItemStatus,
  ModuleCode,
  PrototypeBudgetSummary,
  V2BasicInfo,
  V2PlannerState,
} from "../types";

const includedStatuses: readonly ItemStatus[] = [
  "need",
  "optional",
  "system_recommend",
];

function answerNumber(value: unknown, fallback = 0): number {
  const result = Number(value);
  return Number.isFinite(result) && result > 0 ? result : fallback;
}

function roomListCount(value: unknown): number {
  if (typeof value !== "string" || !value.trim()) return 1;
  return Math.max(1, value.split(/[、,，/]/).filter(Boolean).length);
}

export function estimateModule(code: ModuleCode, state: V2PlannerState): number {
  const definition = moduleCatalog[code];
  const progress = state.modules[code];
  const residents = answerNumber(state.basic.resident_count, 1);
  const area = answerNumber(state.basic.area, 80);

  return definition.items.reduce((total, item) => {
    const status = progress.item_statuses[item.code] ?? "system_recommend";
    if (!includedStatuses.includes(status)) return total;

    let estimate = item.base_estimate;
    if (item.code === "split_air_conditioner") {
      const requested = roomListCount(progress.answers.conditioned_rooms);
      const owned = answerNumber(progress.answers.owned_ac_count);
      estimate *= Math.max(0, requested - owned);
    } else if (item.code === "bed_frame" || item.code === "mattress") {
      estimate *= Math.max(
        1,
        answerNumber(progress.answers.active_bedrooms, Math.ceil(residents / 2)),
      );
    } else if (item.code === "curtains") {
      estimate = 1200 * answerNumber(progress.answers.window_room_count, 3);
    } else if (item.code === "lighting_fixtures") {
      estimate = 700 * Math.max(3, Math.round(area / 18));
    } else if (item.code === "bedding") {
      estimate = 1000 * answerNumber(progress.answers.active_bed_count, 2);
    } else if (item.code === "mesh_node") {
      estimate *= Math.max(1, Math.ceil(area / 80) - 1);
    } else if (item.code === "freestanding_wardrobe") {
      estimate *= Math.max(1, Math.ceil(residents / 2));
    }
    return total + Math.round(estimate);
  }, 0);
}

export function summarizePrototypeBudget(
  state: V2PlannerState,
): PrototypeBudgetSummary {
  const totalBudget = answerNumber(state.basic.total_budget);
  const rawEstimate = moduleOrder.reduce(
    (sum, code) => sum + estimateModule(code, state),
    0,
  );
  const allocatedBudget = Math.min(rawEstimate, totalBudget);
  let remaining = Math.max(0, totalBudget - allocatedBudget);
  let reserveBudget = 0;
  let upgradeBudget = 0;

  if (state.basic.budget_mode === "full_allocation") {
    reserveBudget = Math.min(
      answerNumber(state.basic.reserve_budget_target),
      remaining,
    );
    remaining -= reserveBudget;
    upgradeBudget = Math.min(
      answerNumber(state.basic.upgrade_budget_target),
      remaining,
    );
    remaining -= upgradeBudget;
  }

  return {
    raw_estimate: rawEstimate,
    allocated_budget: allocatedBudget,
    unallocated_budget: remaining,
    upgrade_budget: upgradeBudget,
    reserve_budget: reserveBudget,
  };
}

export function hasBasicInfo(basic: V2BasicInfo): boolean {
  return Boolean(
    basic.city.trim() &&
    basic.house_type.trim() &&
    answerNumber(basic.area) &&
    answerNumber(basic.resident_count) &&
    answerNumber(basic.total_budget),
  );
}
