import type {
  BudgetPlanItem,
  BudgetResult,
  CalculateBudgetInput,
} from "../types/budget";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type JsonObject = Record<string, unknown>;
export const BUDGET_REQUEST_TIMEOUT_MS = 10_000;

interface CalculateBudgetOptions {
  timeoutMs?: number;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError(`服务返回的 ${field} 格式不正确。`, 502);
  }
  return value;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ApiError(`服务返回的 ${field} 格式不正确。`, 502);
  }
  return value;
}

function readStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parsePlanItem(value: unknown): BudgetPlanItem {
  if (!isObject(value)) {
    throw new ApiError("服务返回的预算项目格式不正确。", 502);
  }
  return {
    id: readString(value.id, "预算项目 id"),
    code: readString(value.code, "预算项目 code"),
    name: readString(value.name, "预算项目名称"),
    category: readString(value.category, "预算项目分类"),
    amount: readNumber(value.amount, "预算项目金额"),
    percentage: readNumber(value.percentage, "预算项目比例"),
    minimum_budget: readNumber(value.minimum_budget, "预算项目最低金额"),
    recommended_budget: readNumber(value.recommended_budget, "预算项目建议金额"),
    maximum_budget: readNumber(value.maximum_budget, "预算项目最高金额"),
    value_score: readNumber(value.value_score, "预算项目价值分"),
    reason: readString(value.reason, "预算项目理由"),
  };
}

export function parseBudgetResult(value: unknown): BudgetResult {
  if (!isObject(value) || !isObject(value.current_plan)) {
    throw new ApiError("服务返回的预算方案格式不正确。", 502);
  }
  if (!Array.isArray(value.current_plan.items)) {
    throw new ApiError("服务返回的预算项目列表格式不正确。", 502);
  }
  if (!isObject(value.city_factor)) {
    throw new ApiError("服务未返回城市价格信息。", 502);
  }

  const planId =
    value.plan_id === null || typeof value.plan_id === "string" ? value.plan_id : null;
  return {
    plan_id: planId,
    feasible: Boolean(value.feasible),
    city_factor: {
      city_name: readString(value.city_factor.city_name, "城市名称"),
      labor_factor: readNumber(value.city_factor.labor_factor, "人工系数"),
      material_factor: readNumber(value.city_factor.material_factor, "材料系数"),
      custom_factor: readNumber(value.city_factor.custom_factor, "定制系数"),
    },
    used_default_city_factor: Boolean(value.used_default_city_factor),
    current_plan: {
      total_amount: readNumber(value.current_plan.total_amount, "预算总金额"),
      items: value.current_plan.items.map(parsePlanItem),
    },
    optimization_suggestions: readStringList(value.optimization_suggestions),
    optimization_warnings: readStringList(value.optimization_warnings),
  };
}

function readErrorMessage(body: unknown): string {
  if (!isObject(body)) {
    return "预算服务暂时不可用，请确认 FastAPI 后端已经启动后再试。";
  }
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    const messages = body.detail
      .filter(isObject)
      .map((item) => item.msg)
      .filter((message): message is string => typeof message === "string");
    if (messages.length > 0) return `提交信息有误：${messages.join("；")}`;
  }
  return "预算服务暂时不可用，请确认 FastAPI 后端已经启动后再试。";
}

export async function calculateBudget(
  input: CalculateBudgetInput,
  options: CalculateBudgetOptions = {},
): Promise<BudgetResult> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? BUDGET_REQUEST_TIMEOUT_MS;
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch("/api/budget/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError("预算服务响应超时，请稍后重试。", 0);
    }
    throw new ApiError("无法连接预算服务，请确认 FastAPI 后端已经启动后再试。", 0);
  } finally {
    globalThis.clearTimeout(timeout);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(readErrorMessage(body), response.status);
  }
  return parseBudgetResult(body);
}
