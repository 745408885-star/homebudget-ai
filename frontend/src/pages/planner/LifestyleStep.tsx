import { ChoiceGroup } from "../../components/ChoiceGroup";
import type {
  CookingFrequency,
  DemandLevel,
  PlannerFormData,
} from "../../types/budget";
import { FormHeading } from "./FormHeading";
import type { UpdatePlannerField } from "./types";

const demandOptions: ReadonlyArray<{
  value: DemandLevel;
  label: string;
}> = [
  { value: "low", label: "基础" },
  { value: "medium", label: "重视" },
  { value: "high", label: "非常重视" },
];

const cookingOptions: ReadonlyArray<{
  value: CookingFrequency;
  label: string;
}> = [
  { value: "rarely", label: "很少做饭" },
  { value: "sometimes", label: "偶尔做饭" },
  { value: "often", label: "经常做饭" },
  { value: "daily", label: "每天做饭" },
];

interface LifestyleStepProps {
  form: PlannerFormData;
  update: UpdatePlannerField;
}

export function LifestyleStep({ form, update }: LifestyleStepProps) {
  return (
    <section>
      <FormHeading step="02" title="再聊聊生活方式">
        预算会优先倾向你每天真正使用的空间和物品。
      </FormHeading>
      <ChoiceGroup
        label="做饭频率"
        value={form.cooking_frequency}
        options={cookingOptions}
        onChange={(value) => update("cooking_frequency", value)}
      />
      <ChoiceGroup
        label="睡眠质量"
        value={form.sleep_demand}
        options={demandOptions}
        onChange={(value) => update("sleep_demand", value)}
      />
      <ChoiceGroup
        label="收纳需求"
        value={form.storage_demand}
        options={demandOptions}
        onChange={(value) => update("storage_demand", value)}
      />
      <ChoiceGroup
        label="娱乐需求"
        value={form.entertainment_demand}
        options={demandOptions}
        onChange={(value) => update("entertainment_demand", value)}
      />
    </section>
  );
}
