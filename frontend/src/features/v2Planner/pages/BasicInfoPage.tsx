import { FormEvent, useState } from "react";

import { V2Shell } from "../components/V2Shell";
import type { V2BasicInfo } from "../types";
import { navigateV2, v2Paths } from "../utils/navigation";
import styles from "./BasicInfoPage.module.css";

interface BasicInfoPageProps {
  basic: V2BasicInfo;
  onSave: (basic: V2BasicInfo) => void;
  onClear: () => void;
}

type BasicUpdater = <K extends keyof V2BasicInfo>(
  key: K,
  value: V2BasicInfo[K],
) => void;

function validateBasicInfo(form: V2BasicInfo): string {
  if (!form.city.trim()) return "请填写所在城市。";
  if (!form.house_type.trim()) return "请填写户型。";
  if (Number(form.area) <= 0) return "请填写有效房屋面积。";
  if (Number(form.resident_count) <= 0) return "请填写有效常住人数。";
  if (Number(form.total_budget) <= 0) return "请填写有效预算上限。";
  if (
    form.budget_mode === "full_allocation" &&
    Number(form.reserve_budget_target) + Number(form.upgrade_budget_target) >
      Number(form.total_budget)
  ) {
    return "备用和升级预算不能超过总预算。";
  }
  return "";
}

function BasicFields({
  form,
  onUpdate,
}: {
  form: V2BasicInfo;
  onUpdate: BasicUpdater;
}) {
  return (
    <div className={styles.grid}>
      <label>
        <span>所在城市</span>
        <input
          value={form.city}
          onChange={(event) => onUpdate("city", event.target.value)}
          placeholder="例如：杭州"
        />
      </label>
      <label>
        <span>户型</span>
        <input
          value={form.house_type}
          onChange={(event) => onUpdate("house_type", event.target.value)}
          placeholder="例如：三室两厅"
        />
      </label>
      <NumberField
        label="房屋面积"
        ariaLabel="房屋面积"
        value={form.area}
        unit="㎡"
        placeholder="100"
        onChange={(value) => onUpdate("area", value)}
      />
      <NumberField
        label="常住人数"
        ariaLabel="常住人数"
        value={form.resident_count}
        unit="人"
        placeholder="3"
        onChange={(value) => onUpdate("resident_count", value)}
      />
      <label className={styles.full}>
        <span>家居置办总预算</span>
        <div className={styles.budget}>
          <strong>¥</strong>
          <input
            type="number"
            min="1"
            value={form.total_budget}
            onChange={(event) => onUpdate("total_budget", event.target.value)}
            aria-label="家居置办总预算"
            placeholder="200000"
          />
          <small>上限</small>
        </div>
      </label>
    </div>
  );
}

function NumberField({
  label,
  ariaLabel,
  value,
  unit,
  placeholder,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  unit: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <div className={styles.unit}>
        <input
          type="number"
          min="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel}
          placeholder={placeholder}
        />
        <small>{unit}</small>
      </div>
    </label>
  );
}

function BudgetModeFields({
  form,
  onUpdate,
}: {
  form: V2BasicInfo;
  onUpdate: BasicUpdater;
}) {
  return (
    <details className={styles.mode}>
      <summary>预算使用方式（可选，默认保留结余）</summary>
      <fieldset>
        <legend>预算模式</legend>
        <ModeOption
          checked={form.budget_mode === "ceiling"}
          title="预算上限模式"
          description="建议支出可以低于总预算，不为花满而抬价。"
          onChange={() => onUpdate("budget_mode", "ceiling")}
        />
        <ModeOption
          checked={form.budget_mode === "full_allocation"}
          title="全部分配模式"
          description="结余只能进入指定升级或备用资金。"
          onChange={() => onUpdate("budget_mode", "full_allocation")}
        />
      </fieldset>
      {form.budget_mode === "full_allocation" && (
        <div className={styles.allocationTargets}>
          <label>
            <span>备用资金目标</span>
            <input
              type="number"
              min="0"
              value={form.reserve_budget_target}
              onChange={(event) =>
                onUpdate("reserve_budget_target", event.target.value)
              }
            />
          </label>
          <label>
            <span>品质升级预算目标</span>
            <input
              type="number"
              min="0"
              value={form.upgrade_budget_target}
              onChange={(event) =>
                onUpdate("upgrade_budget_target", event.target.value)
              }
            />
          </label>
        </div>
      )}
    </details>
  );
}

function ModeOption({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label>
      <input type="radio" name="budget_mode" checked={checked} onChange={onChange} />
      <span>
        <strong>{title}</strong>
        {description}
      </span>
    </label>
  );
}

export function BasicInfoPage({ basic, onSave, onClear }: BasicInfoPageProps) {
  const [form, setForm] = useState(basic);
  const [error, setError] = useState("");
  const update: BasicUpdater = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateBasicInfo(form);
    if (validationError) return setError(validationError);
    onSave(form);
    navigateV2(v2Paths.modules);
  };

  return (
    <V2Shell onClear={onClear}>
      <main className={styles.main}>
        <section className={styles.intro}>
          <span className="eyebrow">v0.1.0-alpha.1 · 渐进式规划</span>
          <h1>先用 5 项信息，建立你的家居预算上限。</h1>
          <p>进入工作台后，再按需要配置家电、家具和软装模块。</p>
        </section>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.count}>基础信息 · 5 项</div>
          <BasicFields form={form} onUpdate={update} />
          <BudgetModeFields form={form} onUpdate={update} />
          {error && (
            <div className={styles.error} role="alert">
              ! {error}
            </div>
          )}
          <button type="submit" className={styles.submit}>
            进入家居规划工作台 →
          </button>
          <p className={styles.note}>不会写入数据库；数据仅保存在当前浏览器会话。</p>
        </form>
      </main>
    </V2Shell>
  );
}
