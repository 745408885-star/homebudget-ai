import { LegacyNotice } from "./components/LegacyNotice";
import { useBudgetPlanner } from "./hooks/useBudgetPlanner";
import { V2PlannerApp } from "./features/v2Planner/V2PlannerApp";
import { HomePage } from "./pages/HomePage";
import { PlannerPage } from "./pages/PlannerPage";
import { ResultPage } from "./pages/ResultPage";

export const LEGACY_V1_PATH = "/legacy";

/** Frozen compatibility surface. See docs/legacy-policy.md. */
function LegacyV1App() {
  const planner = useBudgetPlanner();

  if (planner.view === "home") {
    return <HomePage onStart={planner.startPlanning} />;
  }
  if (planner.view === "result" && planner.result) {
    return (
      <ResultPage
        result={planner.result}
        form={planner.form}
        onRestart={planner.restart}
      />
    );
  }
  return (
    <PlannerPage
      form={planner.form}
      onChange={planner.setForm}
      onBackHome={planner.showHome}
      onSubmit={planner.submit}
    />
  );
}

export default function App() {
  const pathname = window.location.pathname;
  if (pathname === LEGACY_V1_PATH || pathname === `${LEGACY_V1_PATH}/`) {
    return (
      <LegacyNotice>
        <LegacyV1App />
      </LegacyNotice>
    );
  }
  return <V2PlannerApp />;
}
