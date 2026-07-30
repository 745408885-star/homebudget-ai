import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { furnitureDefinition } from "./definition";

export interface FurnitureAnswers {
  active_bedrooms?: number;
  sleep_demand?: "low" | "medium" | "high";
  storage_demand?: "low" | "medium" | "high";
}

export function FurnitureModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={furnitureDefinition} {...props} />;
}
