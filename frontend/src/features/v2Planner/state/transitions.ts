import type {
  AnswerValue,
  ItemStatus,
  ModuleCode,
  V2BasicInfo,
  V2PlannerState,
} from "../types";

const BASIC_DEPENDENCY_KEYS: readonly (keyof V2BasicInfo)[] = [
  "city",
  "house_type",
  "area",
  "resident_count",
  "total_budget",
  "budget_mode",
];

const timestamp = () => new Date().toISOString();

export function withBasicInfo(
  current: V2PlannerState,
  basic: V2BasicInfo,
): V2PlannerState {
  const dependencyChanged = BASIC_DEPENDENCY_KEYS.some(
    (key) => current.basic[key] !== basic[key],
  );
  const shouldReconfirm = Boolean(current.basic.city) && dependencyChanged;

  return {
    ...current,
    basic,
    modules: shouldReconfirm
      ? (Object.fromEntries(
          Object.entries(current.modules).map(([code, progress]) => {
            const wasTouched =
              progress.completed ||
              Object.keys(progress.answers).length > 0 ||
              Object.values(progress.item_statuses).some(
                (status) => status !== "system_recommend",
              );
            return [
              code,
              {
                ...progress,
                completed: wasTouched ? false : progress.completed,
                skipped: wasTouched ? false : progress.skipped,
                needs_reconfirmation: wasTouched,
              },
            ];
          }),
        ) as V2PlannerState["modules"])
      : current.modules,
    updated_at: timestamp(),
  };
}

export function withModuleAnswer(
  current: V2PlannerState,
  code: ModuleCode,
  key: string,
  value: AnswerValue,
): V2PlannerState {
  return {
    ...current,
    modules: {
      ...current.modules,
      [code]: {
        ...current.modules[code],
        skipped: false,
        answers: { ...current.modules[code].answers, [key]: value },
      },
    },
    updated_at: timestamp(),
  };
}

export function withItemStatus(
  current: V2PlannerState,
  code: ModuleCode,
  itemCode: string,
  status: ItemStatus,
): V2PlannerState {
  return {
    ...current,
    modules: {
      ...current.modules,
      [code]: {
        ...current.modules[code],
        skipped: false,
        item_statuses: {
          ...current.modules[code].item_statuses,
          [itemCode]: status,
        },
      },
    },
    updated_at: timestamp(),
  };
}

export function withCompletedModule(
  current: V2PlannerState,
  code: ModuleCode,
): V2PlannerState {
  return {
    ...current,
    modules: {
      ...current.modules,
      [code]: {
        ...current.modules[code],
        completed: true,
        skipped: false,
        needs_reconfirmation: false,
      },
    },
    updated_at: timestamp(),
  };
}

export function withSkippedModule(
  current: V2PlannerState,
  code: ModuleCode,
): V2PlannerState {
  return {
    ...current,
    modules: {
      ...current.modules,
      [code]: {
        ...current.modules[code],
        completed: true,
        skipped: true,
        needs_reconfirmation: false,
        item_statuses: Object.fromEntries(
          Object.keys(current.modules[code].item_statuses).map((itemCode) => [
            itemCode,
            "exclude",
          ]),
        ),
      },
    },
    updated_at: timestamp(),
  };
}
