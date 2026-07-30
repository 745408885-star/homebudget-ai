import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { ownedItemsDefinition } from "./definition";

export interface OwnedItemsAnswers {
  owned_item_notes?: string;
  replace_soon_notes?: string;
}

export function OwnedItemsModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={ownedItemsDefinition} {...props} />;
}
