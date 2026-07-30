import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import styles from "./HomePage.module.css";

const productValues = [
  ["01", "只给一个明确方案", "不在多个套餐之间纠结，直接看到预算优先顺序。"],
  ["02", "城市价格进入计算", "人工、材料和定制系数来自可维护的城市规则。"],
  ["03", "方案可以追溯", "需求与结果保存为快照，规则更新不会改写历史。"],
] as const;

function BudgetPreview() {
  return (
    <div className={styles.preview} aria-label="预算方案示例">
      <div className={styles.previewTop}>
        <div>
          <span>当前预算方案</span>
          <strong>¥ 320,000</strong>
        </div>
        <em>可执行</em>
      </div>
      <div className={styles.visual}>
        <div className={styles.ring}>
          <div>
            <span>已分配</span>
            <strong>100%</strong>
          </div>
        </div>
        <div className={styles.legend}>
          <p>
            <i />
            基础与水电 <strong>32%</strong>
          </p>
          <p>
            <i />
            厨卫与定制 <strong>29%</strong>
          </p>
          <p>
            <i />
            家具家电 <strong>31%</strong>
          </p>
        </div>
      </div>
      <div className={styles.insight}>
        <span aria-hidden="true">✦</span>
        <p>
          <strong>优先保护水电与防水</strong>
          预算紧张时，低价值装饰项优先调整。
        </p>
      </div>
    </div>
  );
}

function ProductValues() {
  return (
    <section className={styles.values} aria-label="产品特点">
      {productValues.map(([number, title, copy]) => (
        <article key={number}>
          <span>{number}</span>
          <h2>{title}</h2>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  );
}

export function HomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
        <span>数据库规则 · 可追溯方案</span>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <span className="eyebrow">AI 家装预算规划</span>
            <h1>
              把每一分钱，
              <br />
              花在真正重要的地方。
            </h1>
            <p>
              根据房屋条件、城市价格和生活习惯，生成唯一、清晰、可解释的装修预算方案。
            </p>
            <Button className={styles.start} onClick={onStart}>
              开始规划 <span aria-hidden="true">→</span>
            </Button>
            <div className={styles.trust}>
              <span>约 2 分钟</span>
              <span>预算总额守恒</span>
              <span>每项都有理由</span>
            </div>
          </div>

          <BudgetPreview />
        </section>
        <ProductValues />
      </main>
    </div>
  );
}
