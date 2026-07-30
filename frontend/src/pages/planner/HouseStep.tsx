import type { PlannerFormData } from "../../types/budget";
import styles from "../PlannerPage.module.css";
import { FormHeading } from "./FormHeading";
import type { UpdatePlannerField } from "./types";

interface HouseStepProps {
  form: PlannerFormData;
  update: UpdatePlannerField;
}

export function HouseStep({ form, update }: HouseStepProps) {
  return (
    <section>
      <FormHeading step="01" title="先了解你的房子">
        这些信息用于估算施工规模和城市成本差异。
      </FormHeading>
      <div className={styles.twoColumns}>
        <label className={styles.field}>
          <span>所在城市</span>
          <input
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            placeholder="例如：上海"
          />
        </label>
        <label className={styles.field}>
          <span>房屋面积</span>
          <div className={styles.unitInput}>
            <input
              type="number"
              min="1"
              value={form.area}
              onChange={(event) => update("area", event.target.value)}
              placeholder="100"
            />
            <span>㎡</span>
          </div>
        </label>
      </div>
      <label className={styles.field}>
        <span>常住人数</span>
        <input
          type="number"
          min="1"
          value={form.resident_count}
          onChange={(event) => update("resident_count", event.target.value)}
          placeholder="3"
        />
      </label>
      <label className={styles.field}>
        <span>户型</span>
        <input
          value={form.house_type}
          onChange={(event) => update("house_type", event.target.value)}
          placeholder="例如：三室两厅"
        />
      </label>
      <label className={styles.field}>
        <span>装修目标</span>
        <textarea
          value={form.renovation_goal}
          onChange={(event) => update("renovation_goal", event.target.value)}
          placeholder="例如：耐用、好收纳，优先保证睡眠质量"
          rows={4}
        />
      </label>
    </section>
  );
}
