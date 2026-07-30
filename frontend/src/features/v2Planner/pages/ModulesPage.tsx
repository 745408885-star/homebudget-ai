import { formatCurrency } from "../../../utils/currency";
import { ModuleCard } from "../components/ModuleCard";
import { V2Shell } from "../components/V2Shell";
import { moduleCatalog, moduleOrder } from "../modules/catalog";
import type { V2PlannerState } from "../types";
import { estimateModule } from "../utils/estimates";
import { pendingQuestionCount, selectedItemCount } from "../utils/moduleProgress";
import { navigateV2, v2Paths } from "../utils/navigation";
import styles from "./ModulesPage.module.css";

export function ModulesPage({
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
        <section className={styles.hero}>
          <div>
            <span className="eyebrow">家居规划工作台</span>
            <h1>
              {state.basic.city} · {state.basic.house_type}
            </h1>
            <p>不必一次填完。先进入你关心的模块，其他部分会保留系统默认估算。</p>
          </div>
          <article className={styles.budget}>
            <span>预算上限</span>
            <strong>{formatCurrency(Number(state.basic.total_budget))}</strong>
            <small>
              {state.basic.budget_mode === "ceiling"
                ? "预算上限模式 · 允许保留结余"
                : "全部分配模式 · 仅定向升级/备用"}
            </small>
          </article>
        </section>

        <section className={styles.progress} aria-label="模块完成进度">
          <div>
            <strong>
              {completed} / {moduleOrder.length}
            </strong>
            <span>个模块已完成</span>
          </div>
          <div className={styles.progressActions}>
            <button type="button" onClick={() => navigateV2(v2Paths.basic)}>
              修改基础信息
            </button>
            <button type="button" onClick={() => navigateV2(v2Paths.preview)}>
              查看临时预览
            </button>
          </div>
        </section>

        <div className={styles.notice} role="note">
          当前是模块化交互原型。未完成模块仍使用前端默认估算，不代表正式专业报价。
        </div>

        <section className={styles.grid} aria-label="规划模块">
          {moduleOrder.map((code) => {
            const definition = moduleCatalog[code];
            const progress = state.modules[code];
            return (
              <ModuleCard
                key={code}
                definition={definition}
                progress={progress}
                estimate={estimateModule(code, state)}
                selectedCount={selectedItemCount(definition, progress)}
                pendingCount={pendingQuestionCount(definition, progress)}
                onOpen={() => navigateV2(v2Paths.module(code))}
              />
            );
          })}
        </section>
      </main>
    </V2Shell>
  );
}
