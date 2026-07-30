import { formatCurrency } from "../../../utils/currency";
import type { ModuleDefinition, ModuleProgress } from "../types";
import styles from "./ModuleCard.module.css";

interface ModuleCardProps {
  definition: ModuleDefinition;
  progress: ModuleProgress;
  estimate: number;
  selectedCount: number;
  pendingCount: number;
  onOpen: () => void;
}

export function ModuleCard({
  definition,
  progress,
  estimate,
  selectedCount,
  pendingCount,
  onOpen,
}: ModuleCardProps) {
  const status = progress.needs_reconfirmation
    ? "需重新确认"
    : progress.skipped
      ? "已跳过"
      : progress.completed
        ? "已填写"
        : "待填写";

  return (
    <article className={styles.card}>
      <div className={styles.topline}>
        <span className={styles.icon} aria-hidden="true">
          {definition.icon}
        </span>
        <span className={styles.status}>{status}</span>
      </div>
      <h2>{definition.name}</h2>
      <p>{definition.description}</p>
      <dl>
        <div>
          <dt>当前估算</dt>
          <dd>{formatCurrency(estimate)}</dd>
        </div>
        <div>
          <dt>已选项目</dt>
          <dd>{selectedCount} 项</dd>
        </div>
        <div>
          <dt>待确认</dt>
          <dd>{pendingCount} 个问题</dd>
        </div>
      </dl>
      <button type="button" onClick={onOpen}>
        {progress.completed ? "继续调整" : "进入模块"} →
      </button>
    </article>
  );
}
