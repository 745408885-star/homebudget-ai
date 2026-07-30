import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { beddingAndStorageDefinition } from "./definition";

export interface BeddingAndStorageAnswers {
  active_bed_count?: number;
  storage_demand?: "low" | "medium" | "high";
}

export function BeddingAndStorageModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={beddingAndStorageDefinition} {...props} />;
}
