import type { AnswerValue, ItemStatus, ModuleCode, ModuleProgress } from "../../types";

export interface ModuleComponentProps {
  progress: ModuleProgress;
  estimate: number;
  onAnswer: (key: string, value: AnswerValue) => void;
  onItemStatus: (itemCode: string, status: ItemStatus) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export interface ModuleAnswerEffectContext {
  moduleCode: ModuleCode;
  key: string;
  value: AnswerValue;
  onItemStatus: (itemCode: string, status: ItemStatus) => void;
}
