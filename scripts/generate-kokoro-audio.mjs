import fs from "node:fs";
import path from "node:path";
import { KokoroTTS } from "kokoro-js";

const root = process.cwd();
const manifestPath = path.join(root, "src", "content", "audio-manifest.json");
const outDir = path.join(root, "public", "assets", "audio", "kokoro");
const modelId = "onnx-community/Kokoro-82M-v1.0-ONNX";
const voice = "af_heart";

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing src/content/audio-manifest.json. Run npm run audio:extract first.");
}

fs.mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const tts = await KokoroTTS.from_pretrained(modelId, {
  dtype: "fp32",
  device: "cpu",
});

let generated = 0;
let skipped = 0;
for (const item of manifest.items) {
  const filePath = path.join(root, "public", item.path.replace(/^\/+/, ""));
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 44) {
    skipped += 1;
    continue;
  }
  const audio = await tts.generate(item.text, { voice });
  await audio.save(filePath);
  generated += 1;
  console.log(JSON.stringify({ generated, skipped, path: path.relative(root, filePath), text: item.text }));
}

manifest.generatedAt = new Date().toISOString();
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ generated, skipped, total: manifest.items.length, outDir: path.relative(root, outDir) }, null, 2));
