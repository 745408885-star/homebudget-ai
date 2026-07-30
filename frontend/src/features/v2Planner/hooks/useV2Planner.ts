import { useEffect, useState } from "react";

import type { AnswerValue, ItemStatus, ModuleCode, V2BasicInfo } from "../types";
import { createInitialV2State } from "../state/initialState";
import { clearV2State, loadV2State, saveV2State } from "../state/storage";
import {
  withBasicInfo,
  withCompletedModule,
  withItemStatus,
  withModuleAnswer,
  withSkippedModule,
} from "../state/transitions";

export function useV2Planner() {
  const [state, setState] = useState(loadV2State);

  useEffect(() => {
    saveV2State(state);
  }, [state]);

  const saveBasic = (basic: V2BasicInfo) =>
    setState((current) => withBasicInfo(current, basic));

  const setModuleAnswer = (code: ModuleCode, key: string, value: AnswerValue) =>
    setState((current) => withModuleAnswer(current, code, key, value));

  const setItemStatus = (code: ModuleCode, itemCode: string, status: ItemStatus) =>
    setState((current) => withItemStatus(current, code, itemCode, status));

  const completeModule = (code: ModuleCode) =>
    setState((current) => withCompletedModule(current, code));

  const skipModule = (code: ModuleCode) =>
    setState((current) => withSkippedModule(current, code));

  const clear = () => {
    clearV2State();
    setState(createInitialV2State());
  };

  return {
    state,
    saveBasic,
    setModuleAnswer,
    setItemStatus,
    completeModule,
    skipModule,
    clear,
  };
}
