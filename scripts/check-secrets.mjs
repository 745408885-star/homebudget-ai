import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const candidateFiles = execFileSync(
  "git",
  ["ls-files", "-co", "--exclude-standard"],
  { cwd: projectRoot, encoding: "utf8" },
)
  .split(/\r?\n/)
  .filter(Boolean);

const binaryExtensions = new Set([
  ".ico",
  ".jpg",
  ".jpeg",
  ".png",
  ".woff",
  ".woff2",
]);
const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["github-token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],
  ["github-fine-grained-token", /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
  [
    "jwt",
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  ],
  [
    "database-credential",
    /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@/i,
  ],
];
const placeholderPattern =
  /change-me|example|placeholder|pytest_guard|unit-test|contract_test|ci-only-password|internal-password|super-secret|user:password/i;
const findings = [];

for (const relativePath of candidateFiles) {
  if (binaryExtensions.has(path.extname(relativePath).toLowerCase())) continue;
  const content = await readFile(path.join(projectRoot, relativePath), "utf8");
  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (placeholderPattern.test(line)) continue;
    for (const [ruleName, pattern] of rules) {
      if (pattern.test(line)) {
        findings.push(`${relativePath}:${index + 1} (${ruleName})`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error("敏感信息扫描失败：");
  for (const finding of findings) console.error(`  - ${finding}`);
  process.exit(1);
}
console.log(`敏感信息扫描通过：检查 ${candidateFiles.length} 个候选文件。`);
