import {
  BUDGET_MODES,
  ITEM_STATUSES,
  type AnswerValue,
  type BudgetMode,
  type ItemStatus,
  type ModuleProgress,
  type V2BasicInfo,
  type V2PlannerState,
} from "../types";
import { createInitialV2State } from "./initialState";

export const V2_STORAGE_KEY = "homebudget-ai:v2-prototype";
export const V2_STORAGE_SCHEMA_VERSION = 1;

interface V2StorageEnvelope {
  schemaVersion: typeof V2_STORAGE_SCHEMA_VERSION;
  state: V2PlannerState;
}

type JsonObject = Record<string, unknown>;

const basicStringKeys: readonly (keyof Omit<V2BasicInfo, "budget_mode">)[] = [
  "city",
  "house_type",
  "area",
  "resident_count",
  "total_budget",
  "reserve_budget_target",
  "upgrade_budget_target",
];

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBudgetMode(value: unknown): value is BudgetMode {
  return typeof value === "string" && BUDGET_MODES.includes(value as BudgetMode);
}

function isItemStatus(value: unknown): value is ItemStatus {
  return typeof value === "string" && ITEM_STATUSES.includes(value as ItemStatus);
}

function isAnswerValue(value: unknown): value is AnswerValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

function parseBasicInfo(value: unknown, initial: V2BasicInfo): V2BasicInfo {
  if (!isObject(value)) return initial;
  const parsed = { ...initial };
  for (const key of basicStringKeys) {
    if (typeof value[key] === "string") parsed[key] = value[key];
  }
  if (isBudgetMode(value.budget_mode)) parsed.budget_mode = value.budget_mode;
  return parsed;
}

function parseModuleProgress(value: unknown, initial: ModuleProgress): ModuleProgress {
  if (!isObject(value)) return initial;
  const answers = isObject(value.answers)
    ? Object.fromEntries(
        Object.entries(value.answers).filter((entry): entry is [string, AnswerValue] =>
          isAnswerValue(entry[1]),
        ),
      )
    : {};
  const savedStatuses = isObject(value.item_statuses) ? value.item_statuses : {};
  const itemStatuses = Object.fromEntries(
    Object.entries(initial.item_statuses).map(([itemCode, initialStatus]) => [
      itemCode,
      isItemStatus(savedStatuses[itemCode]) ? savedStatuses[itemCode] : initialStatus,
    ]),
  );
  return {
    completed:
      typeof value.completed === "boolean" ? value.completed : initial.completed,
    skipped: typeof value.skipped === "boolean" ? value.skipped : initial.skipped,
    needs_reconfirmation:
      typeof value.needs_reconfirmation === "boolean"
        ? value.needs_reconfirmation
        : initial.needs_reconfirmation,
    answers,
    item_statuses: itemStatuses,
  };
}

function parsePlannerState(value: unknown): V2PlannerState | null {
  if (!isObject(value) || value.version !== 1) return null;
  const initial = createInitialV2State();
  const savedModules = isObject(value.modules) ? value.modules : {};
  return {
    version: 1,
    basic: parseBasicInfo(value.basic, initial.basic),
    modules: Object.fromEntries(
      Object.entries(initial.modules).map(([code, progress]) => [
        code,
        parseModuleProgress(savedModules[code], progress),
      ]),
    ) as V2PlannerState["modules"],
    updated_at:
      typeof value.updated_at === "string" ? value.updated_at : initial.updated_at,
  };
}

function safeRemove(): void {
  try {
    sessionStorage.removeItem(V2_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
}

function safeSave(state: V2PlannerState): boolean {
  const envelope: V2StorageEnvelope = {
    schemaVersion: V2_STORAGE_SCHEMA_VERSION,
    state,
  };
  try {
    sessionStorage.setItem(V2_STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function loadV2State(): V2PlannerState {
  const initial = createInitialV2State();
  try {
    const raw = sessionStorage.getItem(V2_STORAGE_KEY);
    if (!raw) return initial;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) {
      safeRemove();
      return initial;
    }

    if ("schemaVersion" in parsed) {
      if (parsed.schemaVersion !== V2_STORAGE_SCHEMA_VERSION) {
        safeRemove();
        return initial;
      }
      const state = parsePlannerState(parsed.state);
      if (!state) safeRemove();
      return state ?? initial;
    }

    // Migrate the Phase 6A prototype's unwrapped version-1 payload in place.
    const legacyState = parsePlannerState(parsed);
    if (!legacyState) {
      safeRemove();
      return initial;
    }
    safeSave(legacyState);
    return legacyState;
  } catch {
    safeRemove();
    return initial;
  }
}

export function saveV2State(state: V2PlannerState): boolean {
  return safeSave(state);
}

export function clearV2State(): void {
  safeRemove();
}
