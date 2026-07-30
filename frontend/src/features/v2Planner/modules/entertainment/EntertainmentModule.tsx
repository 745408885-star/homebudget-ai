import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleAnswerEffectContext, ModuleComponentProps } from "../shared/types";
import { entertainmentDefinition } from "./definition";

export interface EntertainmentAnswers {
  watching_frequency?: string;
  living_room_viewing_distance?: number;
  gaming_demand?: string;
  audio_demand?: string;
}

function applyEntertainmentEffect(context: ModuleAnswerEffectContext): void {
  if (context.key === "watching_frequency" && context.value === "never") {
    context.onItemStatus("television", "exclude");
  }
}

export function EntertainmentModule(props: ModuleComponentProps) {
  return (
    <ModuleEditor
      definition={entertainmentDefinition}
      onAnswerEffect={applyEntertainmentEffect}
      {...props}
    />
  );
}
