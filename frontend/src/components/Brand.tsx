import styles from "./Brand.module.css";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.brand} ${compact ? styles.compact : ""}`}>
      <span className={styles.mark} aria-hidden="true">
        住
      </span>
      <span className={styles.name}>住算</span>
      {!compact && <span className={styles.tagline}>HomeBudget AI</span>}
    </div>
  );
}
