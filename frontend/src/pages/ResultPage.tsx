import { useState } from "react";

import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import type { BudgetResult, PlannerFormData } from "../types/budget";
import {
  CityPricePanel,
  PlanDetails,
  ResultHero,
  SuggestionsPanel,
  WarningPanel,
} from "./result/ResultSections";
import styles from "./ResultPage.module.css";

interface ResultPageProps {
  result: BudgetResult;
  form: PlannerFormData;
  onRestart: () => void;
}

export function ResultPage({ result, form, onRestart }: ResultPageProps) {
  const warnings = result.optimization_warnings ?? [];
  const suggestions = result.optimization_suggestions ?? [];
  const [editedAmounts, setEditedAmounts] = useState<Record<string, number>>(
    Object.fromEntries(
      result.current_plan.items.map((item) => [item.code, item.amount]),
    ),
  );

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand compact />
        <Button variant="text" onClick={onRestart}>
          重新规划
        </Button>
      </header>

      <main className={styles.main}>
        <ResultHero result={result} form={form} />
        <CityPricePanel result={result} city={form.city} />
        <WarningPanel warnings={warnings} />
        <PlanDetails
          plan={result.current_plan}
          editedAmounts={editedAmounts}
          onAmountChange={(code, value) =>
            setEditedAmounts((current) => ({
              ...current,
              [code]: Math.max(0, Number(value) || 0),
            }))
          }
        />
        <SuggestionsPanel suggestions={suggestions} />

        <div className={styles.footerAction}>
          <Button variant="secondary" onClick={onRestart}>
            修改需求重新生成
          </Button>
        </div>
      </main>
    </div>
  );
}
