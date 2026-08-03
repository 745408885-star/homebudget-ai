import { appendFile, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const roots = ["backend/app", "frontend/src"];
const warningLineCount = 400;
const sourceExtensions = new Set([".py", ".ts", ".tsx"]);
const excludedSegments = new Set([
  "alembic",
  "coverage",
  "data",
  "dist",
  "node_modules",
  "tests",
]);

async function collectFiles(relativeDirectory) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedSegments.has(entry.name)) {
        files.push(...(await collectFiles(relativePath)));
      }
    } else if (
      sourceExtensions.has(path.extname(entry.name)) &&
      !entry.name.includes(".test.")
    ) {
      files.push(relativePath);
    }
  }
  return files;
}

const files = (await Promise.all(roots.map(collectFiles))).flat();
const inventory = await Promise.all(
  files.map(async (relativePath) => {
    const content = await readFile(path.join(projectRoot, relativePath), "utf8");
    return {
      path: relativePath.replaceAll("\\", "/"),
      lines: content.split(/\r?\n/).length,
    };
  }),
);
inventory.sort((left, right) => right.lines - left.lines);

const warnings = inventory.filter((entry) => entry.lines > warningLineCount);
console.log(`业务源码规模检查：${inventory.length} 个文件，警戒线 ${warningLineCount} 行。`);
for (const entry of inventory.slice(0, 10)) {
  console.log(`${entry.lines.toString().padStart(4)} ${entry.path}`);
}
for (const warning of warnings) {
  console.log(
    `::warning file=${warning.path}::业务文件 ${warning.lines} 行，超过 ${warningLineCount} 行警戒线，请评估拆分。`,
  );
}

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const rows = inventory
    .slice(0, 10)
    .map((entry) => `| ${entry.path} | ${entry.lines} |`)
    .join("\n");
  await appendFile(
    summaryPath,
    `\n### 业务代码规模（warning only）\n\n| 文件 | 行数 |\n|---|---:|\n${rows}\n`,
    "utf8",
  );
}
