import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/Sungwoo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:5173/";
const outDir = path.join(process.cwd(), "docs", "qa-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 1100, height: 700 },
];

const areaNames = ["Literacy", "Math", "Science", "Social Studies"];
const routeChecks = [
  { area: "Literacy", game: "Same Sound, Not Same Sound", screenshot: "literacy-same-sound" },
  { area: "Literacy", game: "Rhyme House", screenshot: "literacy-rhyme-house" },
  { area: "Literacy", game: "CVC Build Tray", screenshot: "literacy-cvc" },
  { area: "Literacy", game: "Fix the Sentence", screenshot: "literacy-fix-sentence" },
  { area: "Literacy", game: "Long A Match", screenshot: "literacy-long-vowel" },
  { area: "Literacy", game: "Sight Word Snack Grab", screenshot: "literacy-sight-word" },
  { area: "Literacy", game: "Opinion Builder", screenshot: "literacy-opinion" },
  { area: "Literacy", game: "Story In Order", screenshot: "literacy-story-order" },
  { area: "Literacy", game: "Punctuation Pop", screenshot: "literacy-punctuation" },
  { area: "Literacy", game: "Context Clue Match", screenshot: "literacy-context" },
  { area: "Math", game: "Number Parking Lot", screenshot: "math-number-parking" },
  { area: "Math", game: "Shape Sort", screenshot: "math-shape-sort" },
  { area: "Math", game: "Shape Hunt", screenshot: "math-shape-hunt" },
  { area: "Math", game: "Equal Shares", screenshot: "math-equal-shares" },
  { area: "Math", game: "Make a Set", screenshot: "math-make-set" },
  { area: "Math", game: "Add To Story Mat", screenshot: "math-addition" },
  { area: "Math", game: "Subtraction Story Mat", screenshot: "math-subtraction" },
  { area: "Math", game: "Measure Classroom Items", screenshot: "math-measure" },
  { area: "Science", game: "Material Sort Lab", screenshot: "science-material" },
  { area: "Science", game: "School Garden Helper", screenshot: "science-garden" },
  { area: "Science", game: "Land and Water Map Builder", screenshot: "science-land-water" },
  { area: "Science", game: "Water on Earth", screenshot: "science-water" },
  { area: "Social Studies", game: "Community Helper Match", screenshot: "social-helper" },
  { area: "Social Studies", game: "My School Map", screenshot: "social-school-map" },
  { area: "Social Studies", game: "How People Earn Money", screenshot: "social-earn-money" },
  { area: "Social Studies", game: "Save for a Goal", screenshot: "social-save-goal" },
  { area: "Social Studies", game: "Help Our Community", screenshot: "social-help-community" },
  { area: "Social Studies", game: "Then and Now", screenshot: "social-then-now" },
];

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function waitForAssetImages(page) {
  await page.waitForFunction(
    () =>
      Array.from(document.images)
        .filter((img) => img.src.includes("/assets/"))
        .every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
    { timeout: 10000 },
  );
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(process.cwd(), file);
}

async function enterHome(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid='terms-agree']", { timeout: 5000 });
  await page.getByTestId("terms-agree").click();
  await page.waitForSelector(".hub-grid", { timeout: 5000 });
}

async function clickVisibleGame(page, gameName) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const game = page.getByRole("button", { name: gameName });
    if ((await game.count()) && (await game.first().isVisible().catch(() => false))) {
      await game.first().click();
      return;
    }
    const nextDot = page.locator(".page-dot:not(.is-current)").first();
    if (!(await nextDot.count())) break;
    await nextDot.click();
    await page.waitForTimeout(250);
  }
  throw new Error(`Game not visible: ${gameName}`);
}

async function screenState(page) {
  return page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll(".hub-tile strong, .game-tile strong, .game-tile span, .game-tile small, .control-button, .instruction-panel")).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        text: el.textContent?.trim() ?? "",
        overflow: el.scrollWidth > rect.width + 6 || el.scrollHeight > rect.height + 6,
        visible: rect.width > 0 && rect.height > 0,
      };
    });
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
      visibleWidth: Math.round(img.getBoundingClientRect().width),
      visibleHeight: Math.round(img.getBoundingClientRect().height),
    }));
    const visibleGameTiles = Array.from(document.querySelectorAll(".game-tile")).filter((tile) => {
      const rect = tile.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }).length;
    const pageDots = Array.from(document.querySelectorAll(".page-dot")).map((dot) => ({
      label: dot.getAttribute("aria-label"),
      current: dot.classList.contains("is-current"),
    }));
    return {
      title: document.querySelector("h1")?.textContent?.trim() || "",
      instruction: document.querySelector(".instruction-panel")?.textContent?.trim() || "",
      bodyScroll: document.body.scrollWidth > window.innerWidth + 2 || document.body.scrollHeight > window.innerHeight + 2,
      overflowingLabels: labels.filter((label) => label.visible && label.overflow),
      gameTileTextLabels: Array.from(document.querySelectorAll(".game-tile strong, .game-tile span, .game-tile small"))
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (el.textContent?.trim() ?? "");
        })
        .map((el) => el.textContent?.trim() ?? ""),
      brokenImages: images.filter((img) => img.src.includes("/assets/") && (!img.width || !img.height)),
      visibleImageCount: images.filter((img) => img.visibleWidth > 20 && img.visibleHeight > 20).length,
      assetImages: images.filter((img) => img.src.includes("/assets/")).map((img) => img.src),
      visibleGameTiles,
      pageDots,
      repeatButtonCount: document.querySelectorAll("[data-testid='repeat-button']").length,
      hasHomeGrid: !!document.querySelector(".hub-grid"),
      hasStartGame: Array.from(document.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Start Game"),
      hasListenFirst: Array.from(document.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Listen First"),
    };
  });
}

async function captureSplashTerms(page, viewport, report) {
  await page.setViewportSize(viewport);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid='terms-agree']", { timeout: 5000 });
  await page.waitForTimeout(2200);
  const stateBefore = await screenState(page);
  const screenshot = await shot(page, `splash-terms-${viewport.width}x${viewport.height}`);
  if (stateBefore.hasHomeGrid) report.issues.push({ type: "splash-auto-advanced", viewport });
  await page.getByTestId("terms-disagree").click();
  await page.waitForTimeout(400);
  const message = await page.getByTestId("terms-message").innerText();
  const blockedState = await screenState(page);
  if (!message.includes("need to agree")) report.issues.push({ type: "terms-disagree-message-missing", viewport, message });
  if (blockedState.hasHomeGrid) report.issues.push({ type: "terms-disagree-allowed-home", viewport });
  report.splash.push({ viewport, screenshot, message, stateBefore, blockedState });
}

async function captureArea(page, area, report) {
  await enterHome(page);
  await page.getByRole("button", { name: area }).click();
  await page.waitForSelector(".game-grid", { timeout: 5000 });
  await waitForAssetImages(page);
  const firstPage = await screenState(page);
  const screenshot = await shot(page, `area-${slug(area)}`);
  if (firstPage.visibleGameTiles > 6) report.issues.push({ type: "too-many-games-on-page", area, visibleGameTiles: firstPage.visibleGameTiles });
  if (firstPage.repeatButtonCount) report.issues.push({ type: "repeat-button-visible", area });
  if (firstPage.gameTileTextLabels.length) {
    report.issues.push({ type: "game-tile-extra-text-label", area, labels: firstPage.gameTileTextLabels });
  }
  if ((area === "Literacy" || area === "Math") && firstPage.pageDots.length < 2) {
    report.issues.push({ type: "missing-page-dots", area, dots: firstPage.pageDots.length });
  }
  report.areas.push({ area, screenshot, firstPage });
}

async function captureRoute(page, check, report) {
  await enterHome(page);
  await page.getByRole("button", { name: check.area }).click();
  await page.waitForSelector(".game-grid", { timeout: 5000 });
  await clickVisibleGame(page, check.game);
  await page.waitForSelector(".model-card", { timeout: 5000 });
  await waitForAssetImages(page);
  const lockedState = await screenState(page);
  if (!lockedState.hasListenFirst && !lockedState.hasStartGame) report.issues.push({ type: "model-start-button-missing", route: check.game });
  const modelState = await screenState(page);
  const modelShot = await shot(page, `${check.screenshot}-model`);
  const start = page.getByRole("button", { name: "Start Game" });
  await start.waitFor({ timeout: 22000 });
  await start.click();
  await page.waitForFunction(() => !Array.from(document.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Start Game"), { timeout: 5000 });
  await page.waitForTimeout(500);
  await waitForAssetImages(page);
  const gameState = await screenState(page);
  const screenshot = await shot(page, check.screenshot);
  for (const src of [...modelState.assetImages, ...gameState.assetImages]) {
    if (src.includes("game-icon-") && !src.includes("/registry-thumbnail-ok/")) report.issues.push({ type: "thumbnail-used-inside-game", route: check.game, src });
    if (src.toLowerCase().includes(".svg")) report.issues.push({ type: "svg-active-image", route: check.game, src });
  }
  report.routes.push({ ...check, modelShot, screenshot, lockedState, modelState, gameState });
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const report = { baseUrl, generatedAt: new Date().toISOString(), splash: [], home: [], areas: [], routes: [], issues: [] };

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await captureSplashTerms(page, viewport, report);
  await page.close();
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await enterHome(page);
  await waitForAssetImages(page);
  const state = await screenState(page);
  const screenshot = await shot(page, `home-${viewport.width}x${viewport.height}`);
  report.home.push({ viewport, screenshot, state });
  await page.close();
}

for (const area of areaNames) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await captureArea(page, area, report);
  await page.close();
}

for (const check of routeChecks) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await captureRoute(page, check, report);
  await page.close();
}

for (const item of [...report.home, ...report.areas]) {
  const state = item.state ?? item.firstPage;
  if (state.bodyScroll) report.issues.push({ type: "body-scroll", item: item.area ?? item.viewport });
  if (state.overflowingLabels.length) report.issues.push({ type: "label-overflow", item: item.area ?? item.viewport, labels: state.overflowingLabels });
  if (state.brokenImages.length) report.issues.push({ type: "broken-images", item: item.area ?? item.viewport, images: state.brokenImages });
}

for (const route of report.routes) {
  for (const [stateName, state] of [["model", route.modelState], ["game", route.gameState]]) {
    if (state.bodyScroll) report.issues.push({ type: "body-scroll", route: route.game, state: stateName });
    if (state.overflowingLabels.length) report.issues.push({ type: "label-overflow", route: route.game, state: stateName, labels: state.overflowingLabels });
    if (state.brokenImages.length) report.issues.push({ type: "broken-images", route: route.game, state: stateName, images: state.brokenImages });
    if (stateName === "game" && state.hasStartGame) report.issues.push({ type: "still-on-model", route: route.game });
  }
}

await browser.close();

const outPath = path.join(process.cwd(), "docs", "VISUAL_SCREEN_QA.json");
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ home: report.home.length, areas: report.areas.length, routes: report.routes.length, issues: report.issues, report: path.relative(process.cwd(), outPath) }, null, 2));
if (report.issues.length) process.exitCode = 1;
