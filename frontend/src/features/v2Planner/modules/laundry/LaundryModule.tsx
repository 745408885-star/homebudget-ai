import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { laundryDefinition } from "./definition";

export interface LaundryAnswers {
  adult_count?: number;
  child_count?: number;
  laundry_frequency?: string;
  drying_condition?: string;
  dryer_demand?: string;
}

export function LaundryModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={laundryDefinition} {...props} />;
}
