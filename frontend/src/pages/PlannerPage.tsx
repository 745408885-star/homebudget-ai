import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { PlannerProgress } from "../components/PlannerProgress";
import type { PlannerFormData } from "../types/budget";
import { BudgetStep } from "./planner/BudgetStep";
import { HouseStep } from "./planner/HouseStep";
import { LifestyleStep } from "./planner/LifestyleStep";
import { usePlannerFlow } from "./planner/usePlannerFlow";
import styles from "./PlannerPage.module.css";

interface PlannerPageProps {
  form: PlannerFormData;
  onChange: (next: PlannerFormData) => void;
  onBackHome: () => void;
  onSubmit: () => Promise<void>;
}

export function PlannerPage({
  form,
  onChange,
  onBackHome,
  onSubmit,
}: PlannerPageProps) {
  const { step, error, submitting, update, next, back, submit } = usePlannerFlow({
    form,
    onChange,
    onBackHome,
    onSubmit,
  });

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Button variant="icon" onClick={back} aria-label="返回">
          ←
        </Button>
        <Brand compact />
        <span>{step} / 3</span>
      </header>

      <main className={styles.main}>
        <PlannerProgress step={step} />
        <form className={styles.card} onSubmit={submit}>
          {step === 1 && <HouseStep form={form} update={update} />}
          {step === 2 && <LifestyleStep form={form} update={update} />}
          {step === 3 && <BudgetStep form={form} update={update} />}

          {error && (
            <div className={styles.error} role="alert">
              ! {error}
            </div>
          )}
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={back}>
              上一步
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={next}>
                继续 →
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "正在计算…" : "生成预算方案 ✦"}
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
