import type { PlannerFormData } from "../../types/budget";
import styles from "../PlannerPage.module.css";
import { FormHeading } from "./FormHeading";
import type { UpdatePlannerField } from "./types";

const budgetPresets = [200000, 300000, 400000, 500000] as const;

interface BudgetStepProps {
  form: PlannerFormData;
  update: UpdatePlannerField;
}

export function BudgetStep({ form, update }: BudgetStepProps) {
  return (
    <section className={styles.budgetStep}>
      <FormHeading step="03" title="你的总预算是多少？">
        系统会保证每个项目金额之和与总预算完全一致。
      </FormHeading>
      <label className={styles.budgetInput}>
        <span>¥</span>
        <input
          type="number"
          min="1"
          value={form.total_budget}
          onChange={(event) => update("total_budget", event.target.value)}
          placeholder="320000"
          aria-label="装修总预算"
        />
        <small>元</small>
      </label>
      <div className={styles.presets}>
        {budgetPresets.map((amount) => (
          <button
            type="button"
            key={amount}
            className={Number(form.total_budget) === amount ? styles.selected : ""}
            onClick={() => update("total_budget", String(amount))}
          >
            {amount / 10000} 万
          </button>
        ))}
      </div>
      <div className={styles.promise}>
        <span>✓</span>
        <p>
          <strong>预算总额守恒</strong>
          数据库规则控制上下限，最终方案不多花也不漏分。
        </p>
      </div>
    </section>
  );
}
