import type { PlannerFormData } from "../../types/budget";

export type UpdatePlannerField = <K extends keyof PlannerFormData>(
  key: K,
  value: PlannerFormData[K],
) => void;
