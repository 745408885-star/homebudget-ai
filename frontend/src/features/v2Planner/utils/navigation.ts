import { useEffect, useState } from "react";

export const v2Paths = {
  basic: "/v2/planner/basic",
  modules: "/v2/planner/modules",
  preview: "/v2/planner/preview",
  module: (code: string) => `/v2/planner/modules/${code}`,
};

export function navigateV2(path: string): void {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return pathname;
}
