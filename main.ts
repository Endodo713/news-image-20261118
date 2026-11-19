import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;
const MAX_SIZE = 1048576;

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

const scriptDir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  fileURLToPath(new URL("entry.png", import.meta.url)),
  join(process.cwd(), "entry.png"),
];

let src = "";
for (const candidate of candidates) {
  try {
    statSync(candidate);
    src = candidate;
    break;
  } catch {
    continue;
  }
}
if (!src) {
  throw new Error("entry.png not found in " + candidates.join(" or "));
}

const data = readFileSync(src);
const size = statSync(src).size;

if (!data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a PNG file");
}
if (data.length < 24) {
  throw new Error("entry.png is too small to be a valid PNG");
}
const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  throw new Error(
    `entry.png must be ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}, got ${width}x${height}`
  );
}
if (size > MAX_SIZE) {
  throw new Error(`entry.png exceeds ${MAX_SIZE} bytes (got ${size})`);
}

const dest = join(outDir, "entry.png");
writeFileSync(dest, data);
console.log(
  `Wrote ${dest} (${size} bytes, ${width}x${height} PNG) from ${src}`
);
