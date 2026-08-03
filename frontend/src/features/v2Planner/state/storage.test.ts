import { beforeEach, describe, expect, it } from "vitest";

import { createInitialV2State } from "./initialState";
import {
  clearV2State,
  loadV2State,
  saveV2State,
  V2_STORAGE_KEY,
  V2_STORAGE_SCHEMA_VERSION,
} from "./storage";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("V2 sessionStorage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  it("saves an explicit schema envelope", () => {
    const state = createInitialV2State();

    expect(saveV2State(state)).toBe(true);

    const saved = JSON.parse(sessionStorage.getItem(V2_STORAGE_KEY) ?? "{}");
    expect(saved.schemaVersion).toBe(V2_STORAGE_SCHEMA_VERSION);
    expect(saved.state.version).toBe(1);
  });

  it("migrates the unwrapped Phase 6A payload", () => {
    const legacyState = createInitialV2State();
    legacyState.basic.city = "杭州";
    sessionStorage.setItem(V2_STORAGE_KEY, JSON.stringify(legacyState));

    const loaded = loadV2State();
    const migrated = JSON.parse(sessionStorage.getItem(V2_STORAGE_KEY) ?? "{}");

    expect(loaded.basic.city).toBe("杭州");
    expect(migrated.schemaVersion).toBe(V2_STORAGE_SCHEMA_VERSION);
  });

  it("recovers from damaged JSON without throwing", () => {
    sessionStorage.setItem(V2_STORAGE_KEY, "{damaged");

    const loaded = loadV2State();

    expect(loaded.basic.city).toBe("");
    expect(sessionStorage.getItem(V2_STORAGE_KEY)).toBeNull();
  });

  it("clears incompatible versions instead of exposing invalid state", () => {
    sessionStorage.setItem(
      V2_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 999, state: { version: 1 } }),
    );

    const loaded = loadV2State();

    expect(loaded.version).toBe(1);
    expect(sessionStorage.getItem(V2_STORAGE_KEY)).toBeNull();
  });

  it("sanitizes invalid field shapes before UI code reads them", () => {
    const state = createInitialV2State();
    sessionStorage.setItem(
      V2_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: V2_STORAGE_SCHEMA_VERSION,
        state: {
          ...state,
          basic: { ...state.basic, city: 42, budget_mode: "invalid" },
          modules: {
            ...state.modules,
            furniture: {
              ...state.modules.furniture,
              answers: { count: { unexpected: true } },
              item_statuses: { sofa: "invalid" },
            },
          },
        },
      }),
    );

    const loaded = loadV2State();

    expect(loaded.basic.city).toBe("");
    expect(loaded.basic.budget_mode).toBe("ceiling");
    expect(loaded.modules.furniture.answers).toEqual({});
    expect(loaded.modules.furniture.item_statuses.sofa).toBe("system_recommend");
  });

  it("clears only the V2 key", () => {
    sessionStorage.setItem("homebudget-ai:planner", "legacy-state");
    sessionStorage.setItem(V2_STORAGE_KEY, "v2-state");

    clearV2State();

    expect(sessionStorage.getItem(V2_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem("homebudget-ai:planner")).toBe("legacy-state");
  });
});
