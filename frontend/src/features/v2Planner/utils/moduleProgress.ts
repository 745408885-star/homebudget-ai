import type { ModuleDefinition, ModuleProgress, ModuleQuestion } from "../types";

const zeroBudgetStatuses = new Set(["owned", "exclude", "later"]);

export function isQuestionVisible(
  question: ModuleQuestion,
  progress: ModuleProgress,
): boolean {
  if (!question.item_codes?.length) return true;
  return question.item_codes.some(
    (itemCode) =>
      !zeroBudgetStatuses.has(progress.item_statuses[itemCode] ?? "system_recommend"),
  );
}

export function pendingQuestionCount(
  definition: ModuleDefinition,
  progress: ModuleProgress,
): number {
  if (progress.skipped) return 0;
  return definition.questions.filter((question) => {
    if (question.advanced || !isQuestionVisible(question, progress)) {
      return false;
    }
    const value = progress.answers[question.key];
    return value === undefined || value === "";
  }).length;
}

export function selectedItemCount(
  definition: ModuleDefinition,
  progress: ModuleProgress,
): number {
  return definition.items.filter(
    (item) =>
      !zeroBudgetStatuses.has(progress.item_statuses[item.code] ?? "system_recommend"),
  ).length;
}
