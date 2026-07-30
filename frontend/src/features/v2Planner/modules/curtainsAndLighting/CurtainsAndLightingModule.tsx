import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { curtainsAndLightingDefinition } from "./definition";

export interface CurtainsAndLightingAnswers {
  window_room_count?: number;
  blackout_demand?: "low" | "medium" | "high";
}

export function CurtainsAndLightingModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={curtainsAndLightingDefinition} {...props} />;
}
