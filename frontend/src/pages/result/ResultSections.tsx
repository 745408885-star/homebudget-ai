import { BudgetGroups } from "../../components/BudgetGroups";
import type { BudgetPlan, BudgetResult, PlannerFormData } from "../../types/budget";
import { formatCurrency } from "../../utils/currency";
import styles from "../ResultPage.module.css";

export function ResultHero({
  result,
  form,
}: {
  result: BudgetResult;
  form: PlannerFormData;
}) {
  return (
    <section className={styles.hero}>
      <div>
        <span
          className={`${styles.status} ${result.feasible ? "" : styles.warningStatus}`}
        >
          {result.feasible ? "✓ 预算处于建议区间" : "! 已执行价值排序优化"}
        </span>
        <h1>
          {form.city} · {form.area}㎡
          <br />
          你的预算方案已生成
        </h1>
        <p>规则、需求和结果已经保存，可继续在当前页面做临时金额调整。</p>
      </div>
      <article className={styles.summary}>
        <span>唯一预算方案</span>
        <strong>{formatCurrency(result.current_plan.total_amount)}</strong>
        <small>{result.current_plan.items.length} 个项目已完整分配</small>
        {result.plan_id && <code>Plan {result.plan_id.slice(0, 8)}</code>}
      </article>
    </section>
  );
}

export function CityPricePanel({
  result,
  city,
}: {
  result: BudgetResult;
  city: string;
}) {
  return (
    <section className={styles.cityPanel} aria-label="城市价格信息">
      <div>
        <span className="eyebrow">城市价格信息</span>
        <h2>{result.city_factor.city_name}价格系数</h2>
        <p>
          {result.used_default_city_factor
            ? `“${city}”暂未配置，当前使用全国默认系数。`
            : `已按“${city}”本地人工、材料与定制价格计算。`}
        </p>
      </div>
      <dl>
        <div>
          <dt>人工</dt>
          <dd>× {result.city_factor.labor_factor.toFixed(2)}</dd>
        </div>
        <div>
          <dt>材料</dt>
          <dd>× {result.city_factor.material_factor.toFixed(2)}</dd>
        </div>
        <div>
          <dt>定制</dt>
          <dd>× {result.city_factor.custom_factor.toFixed(2)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function WarningPanel({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <section className={styles.warningPanel}>
      <div>
        <span aria-hidden="true">!</span>
        <h2>需要注意</h2>
      </div>
      <ul>
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}

export function PlanDetails({
  plan,
  editedAmounts,
  onAmountChange,
}: {
  plan: BudgetPlan;
  editedAmounts: Record<string, number>;
  onAmountChange: (code: string, value: string) => void;
}) {
  const localTotal = Object.values(editedAmounts).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const localDifference = localTotal - plan.total_amount;
  return (
    <section className={styles.planSection}>
      <div className={styles.sectionHeading}>
        <div>
          <span className="eyebrow">预算明细</span>
          <h2>钱会花在哪里</h2>
        </div>
      </div>
      <div
        className={`${styles.editBar} ${
          localDifference === 0 ? styles.balanced : styles.changed
        }`}
      >
        <div>
          <span>本地调整后合计</span>
          <strong>{formatCurrency(localTotal)}</strong>
        </div>
        <p>
          {localDifference === 0
            ? "金额合计与原预算一致"
            : `${localDifference > 0 ? "超出" : "剩余"} ${formatCurrency(
                Math.abs(localDifference),
              )}，暂未自动重分配`}
        </p>
      </div>
      <BudgetGroups
        plan={plan}
        editedAmounts={editedAmounts}
        onAmountChange={onAmountChange}
      />
    </section>
  );
}

export function SuggestionsPanel({ suggestions }: { suggestions: string[] }) {
  const entries = [
    ...suggestions,
    "实际签约前请使用施工报价再次核对材料、人工和现场增项。",
  ];
  return (
    <section className={styles.suggestions}>
      <div className={styles.sectionHeading}>
        <div>
          <span className="eyebrow">优化建议</span>
          <h2>接下来怎么做</h2>
        </div>
      </div>
      <div className={styles.suggestionList}>
        {entries.map((suggestion, index) => (
          <article key={`${suggestion}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{suggestion}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
