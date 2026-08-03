import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, calculateBudget, parseBudgetResult } from "./budget";
import type { CalculateBudgetInput } from "../types/budget";

const requestInput: CalculateBudgetInput = {
  city: "杭州",
  area: 100,
  house_type: "三室两厅",
  total_budget: 280000,
  resident_count: 3,
  cooking_frequency: "daily",
  sleep_demand: "high",
  storage_demand: "medium",
  entertainment_demand: "low",
  renovation_goal: "实用耐用",
};

const validResult = {
  plan_id: "plan-id",
  feasible: true,
  city_factor: {
    city_name: "杭州",
    labor_factor: 1.12,
    material_factor: 1.06,
    custom_factor: 1.1,
  },
  used_default_city_factor: false,
  current_plan: {
    total_amount: 280000,
    items: [
      {
        id: "item-id",
        code: "item-code",
        name: "测试项目",
        category: "测试",
        amount: 280000,
        percentage: 100,
        minimum_budget: 1000,
        recommended_budget: 100000,
        maximum_budget: 300000,
        value_score: 8,
        reason: "契约测试",
      },
    ],
  },
  optimization_suggestions: [],
};

describe("Legacy budget API client", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("defaults missing optimization_warnings to an empty list", () => {
    const result = parseBudgetResult(validResult);

    expect(result.optimization_warnings).toEqual([]);
  });

  it("returns a controlled error for malformed JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>bad gateway</html>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }),
      ),
    );

    await expect(calculateBudget(requestInput)).rejects.toBeInstanceOf(ApiError);
  });

  it("aborts a request after the configured timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }),
    );

    const request = calculateBudget(requestInput, { timeoutMs: 25 });
    const assertion = expect(request).rejects.toThrow("预算服务响应超时");
    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });
});
