import { ModuleEditor } from "../shared/ModuleEditor";
import type { ModuleComponentProps } from "../shared/types";
import { networkAndSmartDefinition } from "./definition";

export interface NetworkAndSmartAnswers {
  area?: number;
  room_count?: number;
  remote_work_demand?: string;
  connected_device_level?: string;
  smart_home_demand?: string;
  security_demand?: string;
  usage_type?: string;
}

export function NetworkAndSmartModule(props: ModuleComponentProps) {
  return <ModuleEditor definition={networkAndSmartDefinition} {...props} />;
}
