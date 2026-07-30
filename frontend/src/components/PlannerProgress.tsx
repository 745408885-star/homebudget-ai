import styles from "./PlannerProgress.module.css";

const labels = ["房屋信息", "生活习惯", "预算"];

export function PlannerProgress({ step }: { step: number }) {
  return (
    <div className={styles.progress} aria-label={`第 ${step} 步，共 3 步`}>
      <div className={styles.track}>
        <span style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <div className={styles.labels}>
        {labels.map((label, index) => (
          <span className={index + 1 <= step ? styles.active : ""} key={label}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
