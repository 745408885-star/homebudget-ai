import { execFileSync } from "node:child_process";

const legacyPatterns = [
  /^backend\/app\/services\/budget_engine(?:_rules|_types)?\.py$/,
  /^backend\/app\/services\/budget_(?:allocation|reporting|scoring)\.py$/,
  /^backend\/app\/api\/routes\/budget\.py$/,
  /^backend\/app\/models\.py$/,
  /^frontend\/src\/api\/budget(?:\.test)?\.ts$/,
  /^frontend\/src\/hooks\/useBudgetPlanner\.ts$/,
  /^frontend\/src\/pages\/(?:HomePage|PlannerPage|ResultPage)/,
  /^frontend\/src\/pages\/planner\//,
  /^frontend\/src\/pages\/result\//,
  /^docs\/legacy-policy\.md$/,
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function changedFiles() {
  const workingTreeFiles = git(["diff", "--name-only"])
    .split(/\r?\n/)
    .filter(Boolean);
  const baseSha = process.env.BASE_SHA?.trim();
  if (baseSha && !/^0+$/.test(baseSha)) {
    return [
      ...git(["diff", "--name-only", `${baseSha}...HEAD`]).split(/\r?\n/),
      ...workingTreeFiles,
    ];
  }
  try {
    return [
      ...git(["diff", "--name-only", "main...HEAD"]).split(/\r?\n/),
      ...workingTreeFiles,
    ];
  } catch {
    return [
      ...git(["diff", "--name-only", "HEAD^", "HEAD"]).split(/\r?\n/),
      ...workingTreeFiles,
    ];
  }
}

const changedLegacyFiles = [
  ...new Set(
    changedFiles()
      .filter(Boolean)
      .filter((file) => legacyPatterns.some((pattern) => pattern.test(file))),
  ),
];

if (changedLegacyFiles.length === 0) {
  console.log("Legacy 冻结检查：未发现 Legacy V1 文件变更。");
} else {
  console.log("::warning::检测到 Legacy V1 冻结范围内的文件变更，请确认仅为允许的稳定性修复：");
  for (const file of changedLegacyFiles) console.log(`  - ${file}`);
}
