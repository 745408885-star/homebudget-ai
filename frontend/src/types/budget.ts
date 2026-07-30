export type DemandLevel = "low" | "medium" | "high";
export type CookingFrequency = "rarely" | "sometimes" | "often" | "daily";

export interface PlannerFormData {
  city: string;
  area: string;
  resident_count: string;
  house_type: string;
  renovation_goal: string;
  cooking_frequency: CookingFrequency;
  sleep_demand: DemandLevel;
  storage_demand: DemandLevel;
  entertainment_demand: DemandLevel;
  total_budget: string;
}

export interface CalculateBudgetInput {
  city: string;
  area: number;
  house_type: string;
  renovation_goal: string;
  cooking_frequency: CookingFrequency;
  sleep_demand: DemandLevel;
  storage_demand: DemandLevel;
  entertainment_demand: DemandLevel;
  total_budget: number;
  resident_count: number;
}

export interface BudgetPlanItem {
  id: string;
  code: string;
  name: string;
  category: string;
  amount: number;
  percentage: number;
  minimum_budget: number;
  recommended_budget: number;
  maximum_budget: number;
  value_score: number;
  reason: string;
}

export interface BudgetPlan {
  total_amount: number;
  items: BudgetPlanItem[];
}

export interface CityFactor {
  city_name: string;
  labor_factor: number;
  material_factor: number;
  custom_factor: number;
}

export interface BudgetResult {
  plan_id: string | null;
  feasible: boolean;
  city_factor: CityFactor;
  used_default_city_factor: boolean;
  current_plan: BudgetPlan;
  optimization_suggestions: string[];
  optimization_warnings: string[];
}
