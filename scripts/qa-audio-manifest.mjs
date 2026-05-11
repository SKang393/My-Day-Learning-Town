import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "src", "content", "audio-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.log(JSON.stringify({ missingManifest: true, missingCount: 1 }, null, 2));
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const missing = [];
const empty = [];

for (const item of manifest.items ?? []) {
  const filePath = path.join(root, "public", String(item.path).replace(/^\/+/, ""));
  if (!fs.existsSync(filePath)) {
    missing.push(item.path);
    continue;
  }
  if (fs.statSync(filePath).size <= 44) empty.push(item.path);
}

const report = {
  manifest: path.relative(root, manifestPath),
  voice: manifest.voice,
  model: manifest.model,
  total: manifest.items?.length ?? 0,
  kokoroWavCount: fs.existsSync(path.join(root, "public", "assets", "audio", "kokoro"))
    ? fs.readdirSync(path.join(root, "public", "assets", "audio", "kokoro")).filter((file) => file.toLowerCase().endsWith(".wav")).length
    : 0,
  missingCount: missing.length,
  emptyCount: empty.length,
  missing: missing.slice(0, 20),
  empty: empty.slice(0, 20),
};

console.log(JSON.stringify(report, null, 2));
if (missing.length || empty.length) process.exitCode = 1;
