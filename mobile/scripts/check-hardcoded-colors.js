#!/usr/bin/env node
/**
 * Guardrail chống tái phát MÀU HARDCODE (hex) trong source mobile.
 *
 * Cơ chế "ratchet" (baseline):
 *  - Quét `src/**` (.ts/.tsx), đếm số mã hex theo từng file.
 *  - So với baseline đã chốt (`scripts/color-baseline.json`).
 *  - FAIL nếu một file có NHIỀU hex hơn baseline (tức vừa thêm màu hardcode mới),
 *    hoặc file MỚI có hex mà chưa nằm trong baseline.
 *  - Nợ cũ (components/styles/landlord…) được giữ nguyên trong baseline → không làm đỏ.
 *    Khi bạn dọn bớt hex trong một file, hãy chạy `--update` để hạ baseline.
 *
 * Bỏ qua:
 *  - Thư mục định nghĩa token: `src/theme/` (nơi ĐƯỢC PHÉP chứa hex nguồn).
 *  - Màu trắng/đen/trong suốt: #fff #ffffff #000 #000000 (và dạng 3 ký tự).
 *
 * Cách dùng:
 *   node scripts/check-hardcoded-colors.js            # kiểm tra (CI/local)
 *   node scripts/check-hardcoded-colors.js --update   # chốt lại baseline
 *
 * Mục tiêu dài hạn: dùng class/token semantic (bg-primary, text-muted, tokens.colors.*)
 * thay cho hex. Xem `src/theme/index.ts`.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const BASELINE_FILE = path.join(__dirname, "color-baseline.json");

const EXCLUDE_DIRS = [path.join("src", "theme")];
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const ALLOW = new Set(["fff", "ffffff", "000", "000000", "ffffffff", "00000000"]);

function isExcluded(rel) {
  return EXCLUDE_DIRS.some((d) => rel === d || rel.startsWith(d + path.sep));
}

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    const rel = path.relative(ROOT, fp);
    if (isExcluded(rel)) continue;
    if (e.isDirectory()) walk(fp, acc);
    else if (/\.(ts|tsx)$/.test(e.name)) acc.push(fp);
  }
  return acc;
}

function countHex(file) {
  const s = fs.readFileSync(file, "utf8");
  const m = s.match(HEX_RE);
  if (!m) return 0;
  let n = 0;
  for (const h of m) {
    if (!ALLOW.has(h.slice(1).toLowerCase())) n++;
  }
  return n;
}

function scan() {
  const files = walk(SRC, []);
  const counts = {};
  for (const f of files) {
    const n = countHex(f);
    if (n > 0) counts[path.relative(ROOT, f).split(path.sep).join("/")] = n;
  }
  return counts;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return {};
  return JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
}

const current = scan();

if (process.argv.includes("--update")) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(current, null, 2) + "\n");
  const total = Object.values(current).reduce((a, b) => a + b, 0);
  console.log(`✔ Đã chốt baseline: ${Object.keys(current).length} file, ${total} hex.`);
  process.exit(0);
}

const baseline = loadBaseline();
const violations = [];
for (const [file, n] of Object.entries(current)) {
  const allowed = baseline[file] || 0;
  if (n > allowed) violations.push({ file, n, allowed });
}

if (violations.length) {
  console.error("✖ Phát hiện MÀU HARDCODE mới (hex) vượt baseline:\n");
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.n} hex (baseline ${v.allowed})`);
  }
  console.error(
    "\nHãy dùng class/token semantic thay cho hex (vd bg-primary, text-muted, tokens.colors.*).",
  );
  console.error(
    "Nếu đây là thay đổi hợp lệ/có chủ đích, chạy: node scripts/check-hardcoded-colors.js --update",
  );
  process.exit(1);
}

const total = Object.values(current).reduce((a, b) => a + b, 0);
console.log(`✔ Không có hex hardcode mới. Nợ hiện tại: ${total} hex (theo baseline).`);
process.exit(0);
