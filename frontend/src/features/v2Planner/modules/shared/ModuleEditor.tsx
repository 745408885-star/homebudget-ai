import { formatCurrency } from "../../../../utils/currency";
import { ItemStatusSelector } from "../../components/ItemStatusSelector";
import type { AnswerValue, ModuleDefinition, ModuleQuestion } from "../../types";
import { isQuestionVisible, pendingQuestionCount } from "../../utils/moduleProgress";
import { navigateV2, v2Paths } from "../../utils/navigation";
import type { ModuleAnswerEffectContext, ModuleComponentProps } from "./types";
import styles from "./ModuleEditor.module.css";

interface ModuleEditorProps extends ModuleComponentProps {
  definition: ModuleDefinition;
  onAnswerEffect?: (context: ModuleAnswerEffectContext) => void;
}

function readFieldValue(question: ModuleQuestion, rawValue: string): AnswerValue {
  if (question.type === "number") return rawValue === "" ? "" : Number(rawValue);
  if (question.type === "boolean") return rawValue === "true";
  return rawValue;
}

function ModuleHero({
  definition,
  estimate,
  pending,
}: {
  definition: ModuleDefinition;
  estimate: number;
  pending: number;
}) {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <span className={styles.icon} aria-hidden="true">
            {definition.icon}
          </span>
          <span className="eyebrow">渐进式模块配置</span>
          <h1>{definition.name}</h1>
          <p>{definition.description}</p>
        </div>
        <article>
          <span>当前前端估算</span>
          <strong>{formatCurrency(estimate)}</strong>
          <small>{pending} 个快速问题待确认</small>
        </article>
      </section>
      <div className={styles.prototypeNotice} role="note">
        这是交互原型。金额来自前端配置占位，尚未接入 Budget Engine V2 正式计算。
      </div>
    </>
  );
}

function ItemStatusPanel({
  definition,
  progress,
  onItemStatus,
}: Pick<ModuleEditorProps, "definition" | "progress" | "onItemStatus">) {
  if (definition.items.length === 0) return null;
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <span>第一层</span>
        <h2>先确认每件物品的状态</h2>
        <p>选择已有、不需要或以后再买后，该项目本期预算立即归零。</p>
      </div>
      <div className={styles.itemList}>
        {definition.items.map((item) => (
          <ItemStatusSelector
            key={item.code}
            itemName={item.name}
            value={progress.item_statuses[item.code] ?? "system_recommend"}
            onChange={(status) => onItemStatus(item.code, status)}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionSection({
  quickQuestions,
  advancedQuestions,
  answers,
  onChange,
}: {
  quickQuestions: ModuleQuestion[];
  advancedQuestions: ModuleQuestion[];
  answers: ModuleComponentProps["progress"]["answers"];
  onChange: (question: ModuleQuestion, value: string) => void;
}) {
  const fields = (questions: ModuleQuestion[]) =>
    questions.map((question) => (
      <QuestionField
        key={question.key}
        question={question}
        value={answers[question.key]}
        onChange={(value) => onChange(question, value)}
      />
    ));
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.heading}>
          <span>第二层</span>
          <h2>快速配置</h2>
          <p>只回答影响数量和规格的关键问题；可以跳过并保留系统默认估算。</p>
        </div>
        {quickQuestions.length > 0 ? (
          <div className={styles.questionGrid}>{fields(quickQuestions)}</div>
        ) : (
          <p className={styles.empty}>当前状态下没有需要继续填写的快速问题。</p>
        )}
      </section>
      {advancedQuestions.length > 0 && (
        <details className={styles.advanced}>
          <summary>第三层：高级设置（可选）</summary>
          <div className={styles.questionGrid}>{fields(advancedQuestions)}</div>
        </details>
      )}
    </>
  );
}

export function ModuleEditor({
  definition,
  progress,
  estimate,
  onAnswer,
  onItemStatus,
  onComplete,
  onSkip,
  onAnswerEffect,
}: ModuleEditorProps) {
  const pending = pendingQuestionCount(definition, progress);
  const quickQuestions = definition.questions.filter(
    (question) => !question.advanced && isQuestionVisible(question, progress),
  );
  const advancedQuestions = definition.questions.filter(
    (question) => question.advanced && isQuestionVisible(question, progress),
  );

  const updateAnswer = (question: ModuleQuestion, rawValue: string) => {
    const value = readFieldValue(question, rawValue);
    onAnswer(question.key, value);
    onAnswerEffect?.({
      moduleCode: definition.code,
      key: question.key,
      value,
      onItemStatus,
    });
  };

  const save = () => {
    onComplete();
    navigateV2(v2Paths.modules);
  };

  const skipModule = () => {
    onSkip();
    navigateV2(v2Paths.modules);
  };

  return (
    <main className={styles.main}>
      <button
        type="button"
        className={styles.back}
        onClick={() => navigateV2(v2Paths.modules)}
      >
        ← 返回模块总览
      </button>

      <ModuleHero definition={definition} estimate={estimate} pending={pending} />
      <ItemStatusPanel
        definition={definition}
        progress={progress}
        onItemStatus={onItemStatus}
      />
      <QuestionSection
        quickQuestions={quickQuestions}
        advancedQuestions={advancedQuestions}
        answers={progress.answers}
        onChange={updateAnswer}
      />

      <div className={styles.footer}>
        <button type="button" className={styles.secondary} onClick={skipModule}>
          本模块不需要
        </button>
        <button type="button" className={styles.primary} onClick={save}>
          保存并返回总览
        </button>
      </div>
    </main>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ModuleQuestion;
  value: AnswerValue | undefined;
  onChange: (value: string) => void;
}) {
  const stringValue = value === undefined ? "" : String(value);
  return (
    <label className={styles.field}>
      <span>{question.label}</span>
      {question.type === "select" || question.type === "boolean" ? (
        <select value={stringValue} onChange={(event) => onChange(event.target.value)}>
          <option value="">暂不确定</option>
          {question.type === "boolean" ? (
            <>
              <option value="true">是</option>
              <option value="false">否</option>
            </>
          ) : (
            question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          )}
        </select>
      ) : (
        <input
          type={question.type}
          min={question.type === "number" ? "0" : undefined}
          value={stringValue}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {question.help && <small>{question.help}</small>}
    </label>
  );
}
