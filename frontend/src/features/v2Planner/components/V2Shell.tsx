import type { PropsWithChildren } from "react";

import { Brand } from "../../../components/Brand";
import { navigateV2, v2Paths } from "../utils/navigation";
import styles from "./V2Shell.module.css";

interface V2ShellProps {
  onClear?: () => void;
}

export function V2Shell({ children, onClear }: PropsWithChildren<V2ShellProps>) {
  const clearPrototype = () => {
    if (window.confirm("确认清空当前会话中的全部 V2 原型数据吗？")) {
      onClear?.();
      navigateV2(v2Paths.basic);
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button
          className={styles.brandButton}
          type="button"
          onClick={() => navigateV2(v2Paths.modules)}
          aria-label="返回 V2 模块总览"
        >
          <Brand compact />
        </button>
        <div className={styles.productStatus}>
          <strong>当前产品主线 · 家居置办预算规划 V2 Alpha</strong>
          <span>Budget Engine V2 尚未正式接入 · 当前金额为原型估算</span>
        </div>
        <div className={styles.actions}>
          <a href="/legacy" className={styles.legacyLink}>
            查看 Legacy V1（已冻结）
          </a>
          {onClear && (
            <button type="button" onClick={clearPrototype} className={styles.clear}>
              清空原型数据
            </button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
