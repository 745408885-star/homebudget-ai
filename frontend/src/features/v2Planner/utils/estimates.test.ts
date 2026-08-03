import { describe, expect, it } from "vitest";

import { moduleCatalog, moduleOrder } from "../modules/catalog";
import { createInitialV2State } from "../state/initialState";
import { withItemStatus } from "../state/transitions";
import { BUDGET_MODES, ITEM_STATUSES, MODULE_CODES, type ItemStatus } from "../types";
import { estimateModule, summarizePrototypeBudget } from "./estimates";

describe("V2 prototype contracts", () => {
  it("keeps the two supported budget modes stable", () => {
    expect(BUDGET_MODES).toEqual(["ceiling", "full_allocation"]);
  });

  it("keeps item status values stable", () => {
    expect(ITEM_STATUSES).toEqual([
      "need",
      "owned",
      "exclude",
      "later",
      "optional",
      "system_recommend",
    ]);
  });

  it("keeps all 12 module codes and their order stable", () => {
    expect(moduleOrder).toEqual(MODULE_CODES);
    expect(moduleOrder).toEqual([
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
    ]);
    expect(Object.keys(moduleCatalog)).toHaveLength(12);
  });

  it.each<ItemStatus>(["owned", "exclude", "later"])(
    "treats %s items as zero current budget",
    (status) => {
      const initial = createInitialV2State();
      const item = moduleCatalog.furniture.items[0];
      const baseline = estimateModule("furniture", initial);
      const changed = withItemStatus(initial, "furniture", item.code, status);

      expect(estimateModule("furniture", changed)).toBe(baseline - item.base_estimate);
    },
  );

  it.each(["ceiling", "full_allocation"] as const)(
    "conserves the total budget in %s mode",
    (budgetMode) => {
      const state = createInitialV2State();
      state.basic.total_budget = "280000";
      state.basic.budget_mode = budgetMode;
      if (budgetMode === "full_allocation") {
        state.basic.reserve_budget_target = "10000";
        state.basic.upgrade_budget_target = "20000";
      }

      const summary = summarizePrototypeBudget(state);

      expect(
        summary.allocated_budget +
          summary.unallocated_budget +
          summary.upgrade_budget +
          summary.reserve_budget,
      ).toBe(280000);
      if (budgetMode === "ceiling") {
        expect(summary.unallocated_budget).toBeGreaterThan(0);
      }
    },
  );
});
