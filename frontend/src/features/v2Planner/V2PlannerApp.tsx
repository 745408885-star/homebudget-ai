import { useV2Planner } from "./hooks/useV2Planner";
import { moduleCatalog } from "./modules/catalog";
import { BasicInfoPage } from "./pages/BasicInfoPage";
import { ModuleRoutePage } from "./pages/ModuleRoutePage";
import { ModulesPage } from "./pages/ModulesPage";
import { PreviewPage } from "./pages/PreviewPage";
import type { ModuleCode } from "./types";
import { estimateModule, hasBasicInfo } from "./utils/estimates";
import { usePathname, v2Paths } from "./utils/navigation";

function isModuleCode(value: string): value is ModuleCode {
  return value in moduleCatalog;
}

export function V2PlannerApp() {
  const planner = useV2Planner();
  const pathname = usePathname();
  const clear = () => {
    planner.clear();
    window.history.replaceState({}, "", v2Paths.basic);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (
    pathname === "/" ||
    pathname === "/v2" ||
    pathname === "/v2/" ||
    pathname === "/v2/planner" ||
    pathname === v2Paths.basic ||
    !hasBasicInfo(planner.state.basic)
  ) {
    return (
      <BasicInfoPage
        basic={planner.state.basic}
        onSave={planner.saveBasic}
        onClear={clear}
      />
    );
  }

  if (pathname === v2Paths.preview) {
    return <PreviewPage state={planner.state} onClear={clear} />;
  }

  const moduleMatch = pathname.match(/^\/v2\/planner\/modules\/([^/]+)$/);
  if (moduleMatch && isModuleCode(moduleMatch[1])) {
    const code = moduleMatch[1];
    return (
      <ModuleRoutePage
        code={code}
        onClear={clear}
        props={{
          progress: planner.state.modules[code],
          estimate: estimateModule(code, planner.state),
          onAnswer: (key, value) => planner.setModuleAnswer(code, key, value),
          onItemStatus: (itemCode, status) =>
            planner.setItemStatus(code, itemCode, status),
          onComplete: () => planner.completeModule(code),
          onSkip: () => planner.skipModule(code),
        }}
      />
    );
  }

  return <ModulesPage state={planner.state} onClear={clear} />;
}
