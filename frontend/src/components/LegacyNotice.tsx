import type { PropsWithChildren } from "react";

import styles from "./LegacyNotice.module.css";

export function LegacyNotice({ children }: PropsWithChildren) {
  return (
    <>
      <aside className={styles.notice} aria-label="Legacy V1 冻结状态">
        <div>
          <strong>Legacy V1（已冻结）</strong>
          <span>此版本仅用于历史兼容和结果对照，后续产品开发以 V2 为主。</span>
        </div>
        <a href="/">返回 V2 当前主线</a>
      </aside>
      {children}
    </>
  );
}
