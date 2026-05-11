import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "src", "content");
const manifestPath = path.join(root, "src", "content", "audio-manifest.json");

function normalizeSpeakText(text) {
  return String(text ?? "")
    .replace(/\s*\(progress:\s*\d+\s*\/\s*\d+\)\s*/gi, " ")
    .replace(/\bprogress:\s*\d+\s*\/\s*\d+\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function walkJson(folder, files = []) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) walkJson(fullPath, files);
    if (entry.isFile() && entry.name.endsWith(".json")) files.push(fullPath);
  }
  return files;
}

function pushLine(lines, text) {
  const normalized = normalizeSpeakText(text);
  if (normalized) lines.add(normalized);
}

function capitalizeFirst(text) {
  const value = String(text ?? "");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function pushFromValue(lines, value) {
  if (!value || typeof value !== "object") return;
  for (const key of ["directions", "instruction", "explanation", "praise", "sentence", "targetWord", "word", "answerPrompt"]) {
    if (typeof value[key] === "string") pushLine(lines, value[key]);
  }
  if (typeof value.objectName === "string") {
    pushLine(lines, `How long is the ${value.objectName}?`);
  }
  if (Array.isArray(value.sounds) && typeof value.word === "string") {
    pushLine(lines, `${value.word}. ${value.sounds.join(", ")}. ${value.word}.`);
  }
  if (typeof value.praise === "string" && typeof value.word === "string") {
    pushLine(lines, `${value.praise} ${capitalizeFirst(value.word)}.`);
  }
  if (typeof value.praise === "string" && typeof value.sentence === "string") {
    pushLine(lines, `${value.praise} ${value.sentence}`);
  }
  if (typeof value.praise === "string" && value.item && typeof value.item.label === "string" && typeof value.rime === "string") {
    pushLine(lines, `${value.praise} ${capitalizeFirst(value.item.label)}, ${value.rime}.`);
  }
  if (Array.isArray(value.options)) {
    for (const option of value.options) {
      if (typeof option.label === "string" && option.label.length < 28) pushLine(lines, option.label);
    }
  }
}

const spokenLines = new Set([
  "Welcome to My Day Learning Town.",
  "Choose a learning area",
  "Choose a Literacy game.",
  "Choose a Math game.",
  "Choose a Science game.",
  "Choose a Social Studies game.",
  "Audio is on.",
  "You need to agree to the Terms of Service to play this game. If you do not agree, please exit the game.",
  "Listen to the word. Choose its picture.",
  "How many all together?",
  "How many are left?",
  "How long is the book?",
  "How long is the desk?",
  "How long is the pencil?",
  "We need one more.",
  "Let's check together.",
  "Too many. Let's take some away.",
  "There are too many. Let's take one away.",
]);

for (let number = 1; number <= 30; number += 1) pushLine(spokenLines, String(number));

for (const file of walkJson(contentRoot)) {
  if (file === manifestPath) continue;
  const parsed = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  pushFromValue(spokenLines, parsed);
  if (parsed.model) pushFromValue(spokenLines, parsed.model);
  for (const round of parsed.rounds ?? []) pushFromValue(spokenLines, round);
}

const items = [...spokenLines].sort((a, b) => a.localeCompare(b)).map((text) => {
  const hash = crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
  const id = `line-${hash}`;
  return {
    id,
    text,
    path: `/assets/audio/kokoro/${id}.wav`,
  };
});

const manifest = {
  voice: "af_heart",
  model: "onnx-community/Kokoro-82M-v1.0-ONNX",
  generatedAt: null,
  items,
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ manifest: path.relative(root, manifestPath), lines: items.length }, null, 2));
