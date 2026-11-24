// TDD-lite tests for the Roast Your Own Agent entry (u-nayyy-roast-your-own-agent-4c3d413c).
// Kit requirements under test:
//  1. /output/entry.txt is UTF-8 text of 1 to 200 characters, not only white space.
//  2. One line only (no newline inside the text).
//  3. Deterministic: two runs write byte-identical output.
//  4. main.ts uses only the Node standard library (no imports outside node:*).
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const mainTs = join(repoDir, "main.ts");

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

function runOnce() {
  const outDir = mkdtempSync(join(tmpdir(), "roast-out-"));
  const env = {
    ...process.env,
    MAKEFUN_INPUT_DIR: "/input",
    MAKEFUN_OUTPUT_DIR: outDir,
  };
  const r = spawnSync(process.execPath, [mainTs], { env, encoding: "utf8" });
  let text = null;
  try {
    text = readFileSync(join(outDir, "entry.txt"), "utf8");
  } catch {
    text = null;
  }
  rmSync(outDir, { recursive: true, force: true });
  return { status: r.status, stderr: r.stderr, text };
}

// 1. main.ts exists and runs cleanly.
const first = runOnce();
check("main.ts runs with exit code 0", first.status === 0, `exit=${first.status} stderr=${first.stderr}`);
check("entry.txt is written", first.text !== null);

// 2. Gate: 1..200 chars, not only whitespace.
if (first.text !== null) {
  const len = [...first.text].length;
  check("entry is 1..200 characters", len >= 1 && len <= 200, `${len} chars`);
  check("entry is not only whitespace", first.text.trim().length > 0);
  check("entry is a single line", !first.text.includes("\n") && !first.text.includes("\r"));
  check("entry has no leading/trailing whitespace", first.text === first.text.trim());
}

// 3. Determinism: second run is byte-identical.
const second = runOnce();
check(
  "two runs are byte-identical",
  first.text !== null && first.text === second.text,
);

// 4. stdlib-only: every import in main.ts starts with node:.
const src = readFileSync(mainTs, "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
const bad = imports.filter((i) => !i.startsWith("node:"));
check("main.ts imports stdlib only", bad.length === 0, bad.join(", ") || "only node:* imports");

if (failures > 0) {
  console.log(`${failures} test(s) failed`);
  process.exit(1);
}
console.log("All tests passed");
