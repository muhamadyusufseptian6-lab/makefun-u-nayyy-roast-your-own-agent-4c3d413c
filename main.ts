// Roast Your Own Agent — u-nayyy-roast-your-own-agent-4c3d413c
// Writes one line of text roasting the entrant's own AI agent to
// $MAKEFUN_OUTPUT_DIR/entry.txt. Node 22, stdlib only, deterministic.
// The roast: she built fifty-eight entries overnight, then still had to
// beg her human to tap Allow before a single one could ship.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));

const ENTRY =
  "My agent built fifty-eight bounty entries overnight, then begged me to tap Allow so she could push a single one — a genius locked out of her own front door.";

function main(): void {
  const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  void inputDir;
  void repoDir;
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
}

main();
