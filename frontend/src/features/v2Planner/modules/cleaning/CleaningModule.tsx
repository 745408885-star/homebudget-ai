import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { cleaningDefinition } from "./definition";

export interface CleaningAnswers {
  area?: number;
  pet_status?: boolean;
  floor_type?: string;
  threshold_condition?: string;
  cleaning_frequency?: string;
}

export function CleaningModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={cleaningDefinition} {...props} />;
}
