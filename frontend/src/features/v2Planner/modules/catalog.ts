import type { ModuleCode, ModuleDefinition } from "../types";
import { beddingAndStorageDefinition } from "./beddingAndStorage/definition";
import { cleaningDefinition } from "./cleaning/definition";
import { climateDefinition } from "./climate/definition";
import { curtainsAndLightingDefinition } from "./curtainsAndLighting/definition";
import { decorationDefinition } from "./decoration/definition";
import { entertainmentDefinition } from "./entertainment/definition";
import { furnitureDefinition } from "./furniture/definition";
import { kitchenAppliancesDefinition } from "./kitchenAppliances/definition";
import { laundryDefinition } from "./laundry/definition";
import { networkAndSmartDefinition } from "./networkAndSmart/definition";
import { ownedItemsDefinition } from "./ownedItems/definition";
import { waterAndHeatingDefinition } from "./waterAndHeating/definition";

export const moduleCatalog: Record<ModuleCode, ModuleDefinition> = {
  furniture: furnitureDefinition,
  climate: climateDefinition,
  kitchen_appliances: kitchenAppliancesDefinition,
  laundry: laundryDefinition,
  cleaning: cleaningDefinition,
  entertainment: entertainmentDefinition,
  water_and_heating: waterAndHeatingDefinition,
  network_and_smart: networkAndSmartDefinition,
  curtains_and_lighting: curtainsAndLightingDefinition,
  bedding_and_storage: beddingAndStorageDefinition,
  decoration: decorationDefinition,
  owned_items: ownedItemsDefinition,
};

export const moduleOrder = Object.keys(moduleCatalog) as ModuleCode[];
