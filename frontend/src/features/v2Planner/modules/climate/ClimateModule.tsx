import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { climateDefinition } from "./definition";

export interface ClimateAnswers {
  conditioned_rooms?: string;
  average_room_area?: number;
  owned_ac_count?: number;
  usage_frequency?: string;
  quietness_demand?: string;
  energy_saving_demand?: string;
}

export function ClimateModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={climateDefinition} {...props} />;
}
