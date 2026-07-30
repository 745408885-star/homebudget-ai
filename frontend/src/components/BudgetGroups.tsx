import { useMemo } from "react";

import type { BudgetPlan, BudgetPlanItem } from "../types/budget";
import { formatCurrency } from "../utils/currency";
import styles from "./BudgetGroups.module.css";

interface BudgetGroupsProps {
  plan: BudgetPlan;
  editedAmounts: Record<string, number>;
  onAmountChange: (code: string, value: string) => void;
}

export function BudgetGroups({
  plan,
  editedAmounts,
  onAmountChange,
}: BudgetGroupsProps) {
  const groups = useMemo(
    () =>
      plan.items.reduce<Record<string, BudgetPlanItem[]>>((result, item) => {
        (result[item.category] ??= []).push(item);
        return result;
      }, {}),
    [plan.items],
  );

  return (
    <div className={styles.groups}>
      {Object.entries(groups).map(([category, items]) => {
        const categoryTotal = items.reduce(
          (sum, item) => sum + (editedAmounts[item.code] ?? item.amount),
          0,
        );
        return (
          <section className={styles.group} key={category}>
            <header>
              <h3>{category}</h3>
              <strong>{formatCurrency(categoryTotal)}</strong>
            </header>
            <div className={styles.items}>
              {items.map((item) => (
                <article className={styles.item} key={item.code}>
                  <div className={styles.itemTop}>
                    <div>
                      <h4>{item.name}</h4>
                      <span>价值分 {item.value_score.toFixed(1)}</span>
                    </div>
                    <label className={styles.editor}>
                      <span>¥</span>
                      <input
                        type="number"
                        min="0"
                        value={editedAmounts[item.code] ?? item.amount}
                        onChange={(event) =>
                          onAmountChange(item.code, event.target.value)
                        }
                        aria-label={`${item.name}当前金额`}
                      />
                    </label>
                  </div>
                  <div className={styles.reason}>
                    <span aria-hidden="true">✦</span>
                    <p>
                      <strong>规则建议</strong>
                      {item.reason}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
