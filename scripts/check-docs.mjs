import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const docsDirectory = path.join(repositoryRoot, "docs");

function walk(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walk(entryPath, predicate);
    }
    return predicate(entryPath) ? [entryPath] : [];
  });
}

function repositoryPath(filePath) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function hasExactCase(targetPath) {
  const relativePath = path.relative(repositoryRoot, targetPath);
  if (
    relativePath === "" ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return relativePath === "";
  }

  let currentPath = repositoryRoot;
  for (const segment of relativePath.split(path.sep)) {
    const entries = fs.readdirSync(currentPath);
    if (!entries.includes(segment)) {
      return false;
    }
    currentPath = path.join(currentPath, segment);
  }
  return true;
}

const problems = [];
const markdownFiles = [
  ...fs
    .readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(repositoryRoot, entry.name)),
  ...walk(docsDirectory, (filePath) => filePath.endsWith(".md")),
  ...walk(
    path.join(repositoryRoot, ".github"),
    (filePath) => filePath.endsWith(".md"),
  ),
];

const validDocsName = /^[a-z0-9]+(?:[.-][a-z0-9]+)*\.md$/;
for (const filePath of walk(docsDirectory, (candidate) =>
  candidate.endsWith(".md"),
)) {
  const relativePath = repositoryPath(filePath);
  const fileName = path.basename(filePath);
  if (relativePath !== "docs/README.md" && !validDocsName.test(fileName)) {
    problems.push(`${relativePath}: 文档文件名不符合小写短横线规范`);
  }
}

for (const directoryPath of walk(docsDirectory).map(path.dirname)) {
  const relativeDirectory = path.relative(docsDirectory, directoryPath);
  if (!relativeDirectory) {
    continue;
  }
  for (const segment of relativeDirectory.split(path.sep)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) {
      problems.push(
        `${repositoryPath(directoryPath)}: docs 子目录名不符合小写短横线规范`,
      );
    }
  }
}

function checkTarget(sourcePath, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  if (
    !target ||
    target.startsWith("#") ||
    target.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target)
  ) {
    return;
  }

  let decodedTarget;
  try {
    decodedTarget = decodeURIComponent(target.split(/[?#]/, 1)[0]);
  } catch {
    problems.push(`${repositoryPath(sourcePath)}: 无法解析链接 ${target}`);
    return;
  }

  const resolvedTarget = path.resolve(path.dirname(sourcePath), decodedTarget);
  const relativeTarget = path.relative(repositoryRoot, resolvedTarget);
  if (
    relativeTarget.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeTarget)
  ) {
    problems.push(`${repositoryPath(sourcePath)}: 链接越出仓库 ${target}`);
    return;
  }
  if (!fs.existsSync(resolvedTarget)) {
    problems.push(`${repositoryPath(sourcePath)}: 链接目标不存在 ${target}`);
    return;
  }
  if (!hasExactCase(resolvedTarget)) {
    problems.push(`${repositoryPath(sourcePath)}: 链接大小写不匹配 ${target}`);
  }
}

for (const markdownFile of markdownFiles) {
  const content = fs.readFileSync(markdownFile, "utf8");
  const targets = [];

  for (const match of content.matchAll(
    /!?\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g,
  )) {
    targets.push(match[1] ?? match[2]);
  }
  for (const match of content.matchAll(/^\s*\[[^\]]+]:\s*(\S+)/gm)) {
    targets.push(match[1]);
  }
  for (const match of content.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    targets.push(match[1]);
  }

  for (const target of targets) {
    checkTarget(markdownFile, target);
  }
}

if (problems.length > 0) {
  console.error(`文档检查失败（${problems.length} 项）：`);
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `文档检查通过：${markdownFiles.length} 个 Markdown 文件，命名和相对链接均有效。`,
  );
}
