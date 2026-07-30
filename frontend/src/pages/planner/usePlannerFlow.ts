import { FormEvent, useState } from "react";

import type { PlannerFormData } from "../../types/budget";

interface UsePlannerFlowOptions {
  form: PlannerFormData;
  onChange: (next: PlannerFormData) => void;
  onBackHome: () => void;
  onSubmit: () => Promise<void>;
}

export function usePlannerFlow({
  form,
  onChange,
  onBackHome,
  onSubmit,
}: UsePlannerFlowOptions) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof PlannerFormData>(
    key: K,
    value: PlannerFormData[K],
  ) => {
    onChange({ ...form, [key]: value });
    setError("");
  };

  const validate = () => {
    if (step === 1) {
      if (!form.city.trim()) return "请填写房屋所在城市。";
      if (!form.area || Number(form.area) <= 0) return "请填写有效面积。";
      if (!form.resident_count || Number(form.resident_count) <= 0) {
        return "请填写有效的常住人数。";
      }
      if (!form.house_type.trim()) return "请填写户型。";
      if (!form.renovation_goal.trim()) return "请填写装修目标。";
    }
    if (step === 3 && (!form.total_budget || Number(form.total_budget) <= 0)) {
      return "请填写有效的装修总预算。";
    }
    return "";
  };

  const next = () => {
    const message = validate();
    if (message) return setError(message);
    setStep((value) => Math.min(3, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (step === 1) return onBackHome();
    setStep((value) => value - 1);
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = validate();
    if (message) return setError(message);
    setSubmitting(true);
    try {
      await onSubmit();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "网络连接失败，请稍后重试。",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { step, error, submitting, update, next, back, submit };
}
