import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { decorationDefinition } from "./definition";

export interface DecorationAnswers {
  appearance_demand?: "low" | "medium" | "high";
  easy_care_needed?: boolean;
}

export function DecorationModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={decorationDefinition} {...props} />;
}
