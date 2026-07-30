import { useEffect, useState } from "react";

import { calculateBudget, parseBudgetResult } from "../api/budget";
import type { BudgetResult, PlannerFormData } from "../types/budget";

export type PlannerView = "home" | "planner" | "result";

export const initialForm: PlannerFormData = {
  city: "",
  area: "",
  resident_count: "3",
  house_type: "",
  renovation_goal: "",
  cooking_frequency: "often",
  sleep_demand: "medium",
  storage_demand: "medium",
  entertainment_demand: "medium",
  total_budget: "",
};

const STORAGE_KEY = "homebudget-ai:planner";

interface SavedPlannerState {
  view: PlannerView;
  form: PlannerFormData;
  result: BudgetResult | null;
}

function loadSavedState(): SavedPlannerState {
  const fallback: SavedPlannerState = {
    view: "home",
    form: initialForm,
    result: null,
  };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as {
      view?: unknown;
      form?: Partial<PlannerFormData>;
      result?: unknown;
    };
    const view =
      saved.view === "home" || saved.view === "planner" || saved.view === "result"
        ? saved.view
        : "home";
    const form = { ...initialForm, ...saved.form };
    const result = saved.result ? parseBudgetResult(saved.result) : null;
    return {
      view: view === "result" && !result ? "home" : view,
      form,
      result,
    };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

export function useBudgetPlanner() {
  const [savedState] = useState(loadSavedState);
  const [view, setView] = useState<PlannerView>(savedState.view);
  const [form, setForm] = useState<PlannerFormData>(savedState.form);
  const [result, setResult] = useState<BudgetResult | null>(savedState.result);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ view, form, result }));
  }, [view, form, result]);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const startPlanning = () => {
    setView("planner");
    goTop();
  };

  const showHome = () => {
    setView("home");
    goTop();
  };

  const restart = () => {
    setResult(null);
    setView("planner");
    goTop();
  };

  const submit = async (): Promise<void> => {
    const nextResult = await calculateBudget({
      city: form.city.trim(),
      area: Number(form.area),
      house_type: form.house_type.trim(),
      renovation_goal: form.renovation_goal.trim(),
      cooking_frequency: form.cooking_frequency,
      sleep_demand: form.sleep_demand,
      storage_demand: form.storage_demand,
      entertainment_demand: form.entertainment_demand,
      total_budget: Number(form.total_budget),
      resident_count: Number(form.resident_count),
    });
    setResult(nextResult);
    setView("result");
    goTop();
  };

  return {
    view,
    form,
    result,
    setForm,
    startPlanning,
    showHome,
    restart,
    submit,
  };
}
