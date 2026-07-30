import styles from "./ChoiceGroup.module.css";

interface ChoiceGroupProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend>{label}</legend>
      <div className={`${styles.grid} ${options.length === 4 ? styles.four : ""}`}>
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={value === option.value ? styles.selected : ""}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
