import type { V2PlannerState } from "../types";
import { createInitialV2State } from "./initialState";

export const V2_STORAGE_KEY = "homebudget-ai:v2-prototype";

export function loadV2State(): V2PlannerState {
  try {
    const raw = sessionStorage.getItem(V2_STORAGE_KEY);
    if (!raw) return createInitialV2State();
    const parsed = JSON.parse(raw) as Partial<V2PlannerState>;
    const initial = createInitialV2State();
    if (parsed.version !== 1 || !parsed.basic || !parsed.modules) {
      return initial;
    }
    return {
      ...initial,
      ...parsed,
      basic: { ...initial.basic, ...parsed.basic },
      modules: Object.fromEntries(
        Object.entries(initial.modules).map(([code, progress]) => [
          code,
          {
            ...progress,
            ...parsed.modules?.[code as keyof typeof parsed.modules],
            answers: {
              ...progress.answers,
              ...parsed.modules?.[code as keyof typeof parsed.modules]?.answers,
            },
            item_statuses: {
              ...progress.item_statuses,
              ...parsed.modules?.[code as keyof typeof parsed.modules]?.item_statuses,
            },
          },
        ]),
      ) as V2PlannerState["modules"],
    };
  } catch {
    return createInitialV2State();
  }
}

export function saveV2State(state: V2PlannerState): void {
  sessionStorage.setItem(V2_STORAGE_KEY, JSON.stringify(state));
}

export function clearV2State(): void {
  sessionStorage.removeItem(V2_STORAGE_KEY);
}
