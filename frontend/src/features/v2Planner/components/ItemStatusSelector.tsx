import type { ItemStatus } from "../types";
import styles from "./ItemStatusSelector.module.css";

const statusOptions: readonly { value: ItemStatus; label: string }[] = [
  { value: "need", label: "需要购买" },
  { value: "owned", label: "已经拥有" },
  { value: "exclude", label: "不需要" },
  { value: "later", label: "以后再买" },
  { value: "optional", label: "可选" },
  { value: "system_recommend", label: "让系统推荐" },
];

interface ItemStatusSelectorProps {
  itemName: string;
  value: ItemStatus;
  onChange: (status: ItemStatus) => void;
}

export function ItemStatusSelector({
  itemName,
  value,
  onChange,
}: ItemStatusSelectorProps) {
  const zeroBudget = value === "owned" || value === "exclude" || value === "later";

  return (
    <fieldset className={styles.selector}>
      <legend>{itemName}</legend>
      <div>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className={value === option.value ? styles.selected : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {zeroBudget && (
        <p>
          {value === "later"
            ? "保留未来参考，本期预算为 0。"
            : "本期不再询问配置，预算为 0。"}
        </p>
      )}
    </fieldset>
  );
}
