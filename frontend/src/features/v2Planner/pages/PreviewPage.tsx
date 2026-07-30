import { formatCurrency } from "../../../utils/currency";
import { V2Shell } from "../components/V2Shell";
import { moduleCatalog, moduleOrder } from "../modules/catalog";
import type { ItemStatus, V2PlannerState } from "../types";
import { estimateModule, summarizePrototypeBudget } from "../utils/estimates";
import { navigateV2, v2Paths } from "../utils/navigation";
import styles from "./PreviewPage.module.css";

const statusGroups: readonly {
  status: ItemStatus;
  title: string;
  empty: string;
}[] = [
  { status: "owned", title: "已有项目", empty: "尚未标记已有物品" },
  { status: "exclude", title: "已排除项目", empty: "尚未排除项目" },
  { status: "later", title: "延后购买", empty: "尚未设置延后项目" },
];

function itemsByStatus(state: V2PlannerState, status: ItemStatus): string[] {
  return moduleOrder.flatMap((code) =>
    moduleCatalog[code].items
      .filter((item) => state.modules[code].item_statuses[item.code] === status)
      .map((item) => item.name),
  );
}

function PreviewHero({
  state,
  completed,
}: {
  state: V2PlannerState;
  completed: number;
}) {
  return (
    <section className={styles.hero}>
      <div>
        <span className="eyebrow">预算结果工作台 · 临时预览</span>
        <h1>
          当前完成 {completed}/{moduleOrder.length} 个模块
        </h1>
        <p>未完成模块仍使用默认估算。信息越完整，下一阶段的正式计算才会越可靠。</p>
      </div>
      <article>
        <span>总预算上限</span>
        <strong>{formatCurrency(Number(state.basic.total_budget))}</strong>
        <small>{state.basic.budget_mode}</small>
      </article>
    </section>
  );
}

function BudgetAccounting({ state }: { state: V2PlannerState }) {
  const summary = summarizePrototypeBudget(state);
  const entries = [
    ["建议采购支出", summary.allocated_budget],
    ["未分配预算", summary.unallocated_budget],
    ["定向升级", summary.upgrade_budget],
    ["备用资金", summary.reserve_budget],
  ] as const;
  return (
    <>
      <section className={styles.accounting} aria-label="预算模式预览">
        {entries.map(([label, amount]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{formatCurrency(amount)}</strong>
          </article>
        ))}
      </section>
      {state.basic.budget_mode === "full_allocation" &&
        summary.unallocated_budget > 0 && (
          <div className={styles.incomplete} role="alert">
            全部分配模式仍有 {formatCurrency(summary.unallocated_budget)} 未指定去向。
            请设置升级或备用资金；原型不会自动平均加价。
          </div>
        )}
    </>
  );
}

function ModuleEstimatePanel({ state }: { state: V2PlannerState }) {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span className="eyebrow">模块估算</span>
        <h2>钱可能花在哪里</h2>
      </div>
      <div className={styles.moduleRows}>
        {moduleOrder
          .filter((code) => code !== "owned_items")
          .map((code) => (
            <div key={code}>
              <span>{moduleCatalog[code].name}</span>
              <strong>{formatCurrency(estimateModule(code, state))}</strong>
              <small>{state.modules[code].completed ? "已确认" : "默认估算"}</small>
            </div>
          ))}
      </div>
    </section>
  );
}

function ItemStatusGroups({ state }: { state: V2PlannerState }) {
  return (
    <section className={styles.statusGrid}>
      {statusGroups.map((group) => {
        const names = itemsByStatus(state, group.status);
        return (
          <article key={group.status}>
            <h2>{group.title}</h2>
            {names.length ? (
              <ul>
                {names.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : (
              <p>{group.empty}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}

export function PreviewPage({
  state,
  onClear,
}: {
  state: V2PlannerState;
  onClear: () => void;
}) {
  const completed = moduleOrder.filter((code) => state.modules[code].completed).length;

  return (
    <V2Shell onClear={onClear}>
      <main className={styles.main}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigateV2(v2Paths.modules)}
        >
          ← 返回模块总览
        </button>

        <PreviewHero state={state} completed={completed} />
        <div className={styles.warning} role="note">
          交互原型，尚未接入 Budget Engine V2 正式计算。以下金额不是专业报价。
        </div>
        <BudgetAccounting state={state} />
        <ModuleEstimatePanel state={state} />
        <ItemStatusGroups state={state} />
      </main>
    </V2Shell>
  );
}
