import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Sungwoo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:5173/";
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1100, height: 700 },
  { width: 1024, height: 768 }
];
const report = { baseUrl, viewports: [], checks: [], issues: [] };

function issue(entry) {
  report.issues.push(entry);
}

async function overflow(page, selector) {
  return page.$$eval(selector, (els) =>
    els.map((el) => ({
      text: (el.textContent || "").trim(),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      overflow: el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2
    }))
  );
}

async function scrollState(page) {
  return page.evaluate(() => ({
    body: document.scrollingElement ? document.scrollingElement.scrollHeight > document.scrollingElement.clientHeight + 2 : false,
    mount: !!document.querySelector(".game-mount") && document.querySelector(".game-mount").scrollHeight > document.querySelector(".game-mount").clientHeight + 2,
    card: !!document.querySelector(".game-card") && document.querySelector(".game-card").scrollHeight > document.querySelector(".game-card").clientHeight + 2
  }));
}

async function clickTile(page, name) {
  await page.getByRole("button", { name }).first().click();
  await page.waitForTimeout(250);
}

async function enterHome(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const agree = page.getByTestId("terms-agree");
  if (await agree.count()) await agree.click();
  await page.waitForSelector(".hub-grid", { timeout: 5000 });
}

async function clickVisibleGame(page, gamePattern) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const game = page.getByRole("button", { name: gamePattern });
    if ((await game.count()) && (await game.first().isVisible().catch(() => false))) {
      await game.first().click();
      return;
    }
    const nextDot = page.locator(".page-dot:not(.is-current)").first();
    if (!(await nextDot.count())) break;
    await nextDot.click();
    await page.waitForTimeout(250);
  }
  throw new Error(`Game not visible: ${gamePattern}`);
}

async function startGame(page, areaPattern, gamePattern) {
  await enterHome(page);
  await page.getByRole("button", { name: areaPattern }).click();
  await clickVisibleGame(page, gamePattern);
  await page.waitForSelector(".model-card", { timeout: 5000 });
  const start = page.getByRole("button", { name: "Start Game" });
  await start.waitFor({ timeout: 22000 });
  await start.click();
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await enterHome(page);
  const labels = await overflow(page, ".hub-tile strong, .tile-label, button strong");
  const bodyScroll = await page.evaluate(() => document.scrollingElement ? document.scrollingElement.scrollHeight > document.scrollingElement.clientHeight + 2 : false);
  report.viewports.push({ viewport, bodyScroll, labels });
  if (bodyScroll) issue({ type: "home-scroll", viewport });
  for (const label of labels) if (label.overflow) issue({ type: "label-overflow", viewport, label });
  const body = await page.textContent("body");
  if (!body.includes("Choose a learning area")) issue({ type: "home-instruction-missing", viewport });
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await enterHome(page);
if (await page.getByTestId("repeat-button").count()) issue({ type: "repeat-button-still-visible" });
await page.getByTestId("instruction-panel").click();
await page.waitForTimeout(800);
await page.getByTestId("settings-button").click();
await page.waitForTimeout(300);
const settingsText = await page.locator(".settings-panel").innerText();
report.checks.push({ name: "settings-panel", settingsText });
for (const expected of ["Audio Settings", "Video Settings", "Game Settings", "Voice Speed", "Speech Volume", "Chime Volume", "Praise Wait", "Reset Game Progress", "Reset All Settings to Default"]) {
  if (!settingsText.includes(expected)) issue({ type: "settings-control-missing", expected });
}
const oldDebugSelector = "[data-testid='" + "audio" + "-" + "debug" + "']";
if (await page.locator(oldDebugSelector).count()) issue({ type: "old-audio-ui-visible" });
const forbiddenAudioLabels = ["openai", "open ai", "microsoft", "google"];
if (forbiddenAudioLabels.some((label) => settingsText.toLowerCase().includes(label))) issue({ type: "cloud-audio-label-visible", settingsText });

await startGame(page, /^Literacy/, /Same Sound, Not Same Sound/);
await page.mouse.move(300, 6);
await page.waitForTimeout(100);
const backVisible = await page.getByTestId("back-area-button").isVisible().catch(() => false);
if (!backVisible) issue({ type: "back-area-hidden-or-missing" });
await page.getByTestId("back-area-button").click();
await page.waitForTimeout(300);
if (!((await page.textContent("body")) || "").includes("Literacy")) issue({ type: "back-area-did-not-return-literacy" });

await startGame(page, /^Math/, /Number Parking Lot/);
const numberScroll = await scrollState(page);
if (numberScroll.body || numberScroll.mount || numberScroll.card) issue({ type: "number-parking-scroll", numberScroll });
const numberImages = await page.$$eval("img", (imgs) => imgs.map((img) => ({ src: img.getAttribute("src"), width: img.naturalWidth, height: img.naturalHeight })).filter((img) => img.src));
report.checks.push({ name: "number-parking-images", count: numberImages.length, unloaded: numberImages.filter((img) => !img.width || !img.height).slice(0, 10) });
if (numberImages.some((img) => !img.width || !img.height)) issue({ type: "image-load-failure", unloaded: numberImages.filter((img) => !img.width || !img.height).slice(0, 10) });

await browser.close();
fs.writeFileSync("docs/QA_CURRENT_PASS.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.issues.length) process.exitCode = 1;
