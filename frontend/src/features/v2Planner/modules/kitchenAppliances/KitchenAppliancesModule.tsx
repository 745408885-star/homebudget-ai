import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { kitchenAppliancesDefinition } from "./definition";

export interface KitchenAppliancesAnswers {
  cooking_frequency?: string;
  resident_count?: number;
  food_storage_demand?: string;
  cooking_energy_type?: string;
  dishwasher_demand?: string;
  brand_preference?: string;
}

export function KitchenAppliancesModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={kitchenAppliancesDefinition} {...props} />;
}
