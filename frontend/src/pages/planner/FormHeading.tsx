import styles from "../PlannerPage.module.css";

interface FormHeadingProps {
  step: string;
  title: string;
  children: string;
}

export function FormHeading({ step, title, children }: FormHeadingProps) {
  return (
    <div className={styles.heading}>
      <span className="eyebrow">STEP {step}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
