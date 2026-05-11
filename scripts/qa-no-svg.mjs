import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const svgExt = "." + "svg";
const ignoredDirs = new Set(["node_modules", ".git", "dist", "release", ".desktop-staging", "LFI Games"]);
const fileRoots = ["src", "public/assets"];
const referenceRoots = ["src", "public", "electron"];
const extraReferenceFiles = ["index.html"];

function walk(start, files = []) {
  if (!fs.existsSync(start)) return files;
  const stat = fs.statSync(start);
  if (stat.isFile()) {
    files.push(start);
    return files;
  }
  if (!stat.isDirectory()) return files;
  const base = path.basename(start);
  if (ignoredDirs.has(base)) return files;
  for (const entry of fs.readdirSync(start)) {
    walk(path.join(start, entry), files);
  }
  return files;
}

function isTextFile(file) {
  const ext = path.extname(file).toLowerCase();
  return [
    ".ts",
    ".tsx",
    ".js",
    ".cjs",
    ".mjs",
    ".json",
    ".css",
    ".html",
    ".md",
    ".txt",
  ].includes(ext);
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

const runtimeSvgFiles = fileRoots
  .flatMap((folder) => walk(path.join(root, folder)))
  .filter((file) => path.extname(file).toLowerCase() === svgExt)
  .map(relative);

const referenceFiles = [
  ...referenceRoots.flatMap((folder) => walk(path.join(root, folder))),
  ...extraReferenceFiles.map((file) => path.join(root, file)).filter((file) => fs.existsSync(file)),
].filter(isTextFile);

const svgReferences = [];
for (const file of referenceFiles) {
  const text = fs.readFileSync(file, "utf8");
  if (text.toLowerCase().includes(svgExt)) {
    svgReferences.push(relative(file));
  }
}

const embeddedSvgMarkers = ["image/" + "svg+xml", "<" + "svg", "data:image/" + "svg+xml"];
const embeddedSvgFiles = [];
for (const file of fileRoots.flatMap((folder) => walk(path.join(root, folder)))) {
  const relativePath = relative(file);
  const buffer = fs.readFileSync(file);
  const text = buffer.toString("latin1").toLowerCase();
  if (embeddedSvgMarkers.some((marker) => text.includes(marker))) embeddedSvgFiles.push(relativePath);
}

const report = {
  runtimeSvgFiles,
  svgReferences,
  embeddedSvgFiles,
  runtimeSvgFileCount: runtimeSvgFiles.length,
  svgReferenceFileCount: svgReferences.length,
  embeddedSvgFileCount: embeddedSvgFiles.length,
};

console.log(JSON.stringify(report, null, 2));

if (runtimeSvgFiles.length || svgReferences.length || embeddedSvgFiles.length) {
  process.exitCode = 1;
}
