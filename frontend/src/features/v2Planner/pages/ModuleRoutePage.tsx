import type { ComponentType } from "react";

import { V2Shell } from "../components/V2Shell";
import { BeddingAndStorageModule } from "../modules/beddingAndStorage/BeddingAndStorageModule";
import { CleaningModule } from "../modules/cleaning/CleaningModule";
import { ClimateModule } from "../modules/climate/ClimateModule";
import { CurtainsAndLightingModule } from "../modules/curtainsAndLighting/CurtainsAndLightingModule";
import { DecorationModule } from "../modules/decoration/DecorationModule";
import { EntertainmentModule } from "../modules/entertainment/EntertainmentModule";
import { FurnitureModule } from "../modules/furniture/FurnitureModule";
import { KitchenAppliancesModule } from "../modules/kitchenAppliances/KitchenAppliancesModule";
import { LaundryModule } from "../modules/laundry/LaundryModule";
import { NetworkAndSmartModule } from "../modules/networkAndSmart/NetworkAndSmartModule";
import { OwnedItemsModule } from "../modules/ownedItems/OwnedItemsModule";
import type { ModuleComponentProps } from "../modules/shared/types";
import { WaterAndHeatingModule } from "../modules/waterAndHeating/WaterAndHeatingModule";
import type { ModuleCode } from "../types";

const moduleComponents: Record<ModuleCode, ComponentType<ModuleComponentProps>> = {
  furniture: FurnitureModule,
  climate: ClimateModule,
  kitchen_appliances: KitchenAppliancesModule,
  laundry: LaundryModule,
  cleaning: CleaningModule,
  entertainment: EntertainmentModule,
  water_and_heating: WaterAndHeatingModule,
  network_and_smart: NetworkAndSmartModule,
  curtains_and_lighting: CurtainsAndLightingModule,
  bedding_and_storage: BeddingAndStorageModule,
  decoration: DecorationModule,
  owned_items: OwnedItemsModule,
};

export function ModuleRoutePage({
  code,
  props,
  onClear,
}: {
  code: ModuleCode;
  props: ModuleComponentProps;
  onClear: () => void;
}) {
  const Component = moduleComponents[code];
  return (
    <V2Shell onClear={onClear}>
      <Component {...props} />
    </V2Shell>
  );
}
