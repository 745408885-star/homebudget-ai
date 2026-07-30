import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { waterAndHeatingDefinition } from "./definition";

export interface WaterAndHeatingAnswers {
  existing_hot_water_system?: string;
  water_heater_replacement_needed?: boolean;
  bathroom_count?: number;
  resident_count?: number;
  drinking_water_demand?: string;
}

export function WaterAndHeatingModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={waterAndHeatingDefinition} {...props} />;
}
