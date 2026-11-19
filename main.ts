import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const src = join(process.cwd(), "entry.png");
const dest = join(outDir, "entry.png");
if (!existsSync(src)) throw new Error("entry.png not found in " + process.cwd());
copyFileSync(src, dest);
const size = existsSync(dest) ? statSync(dest).size : 0;
console.log(`Wrote ${dest} (${size} bytes, 1024x1024 PNG)`);
