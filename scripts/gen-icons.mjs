/**
 * Generates PNG icons from public/icons/pwa-512.svg using sharp.
 * Run once before first deploy: node scripts/gen-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");

const svgBuf = readFileSync(resolve(root, "public/icons/pwa-512.svg"));

const targets = [
  { file: "public/icons/pwa-192.png", size: 192 },
  { file: "public/icons/pwa-512.png", size: 512 },
  { file: "public/icons/apple-touch-icon.png", size: 180 }, // iOS standard
];

for (const { file, size } of targets) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(resolve(root, file));
  console.log(`✓ ${file}`);
}
