const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "qa-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const target = process.env.QA_URL || "http://127.0.0.1:5173/";
const sizes = [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
  [1100, 700],
  [1024, 768],
];

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function evaluate(win, script) {
  return win.webContents.executeJavaScript(script, true);
}

async function clickByText(win, text) {
  return evaluate(
    win,
    `(() => {
      const target = Array.from(document.querySelectorAll("button")).find((button) => button.textContent.trim().includes(${JSON.stringify(text)}));
      if (!target) return false;
      target.click();
      return true;
    })()`,
  );
}

async function clickSelector(win, selector) {
  return evaluate(
    win,
    `(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return false;
      target.click();
      return true;
    })()`,
  );
}

async function enterHome(win) {
  await wait(400);
  const started = await clickSelector(win, "[data-testid='terms-agree']");
  await wait(700);
  const reachedHome = await evaluate(win, `!!document.querySelector(".hub-grid")`);
  return started || reachedHome;
}

async function clickGameWithPaging(win, text) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const clicked = await evaluate(
      win,
      `(() => {
        const target = Array.from(document.querySelectorAll("button"))
          .find((button) => button.getAttribute("aria-label") === ${JSON.stringify(text)} && button.getBoundingClientRect().width > 0 && button.getBoundingClientRect().height > 0);
        if (!target) return false;
        target.click();
        return true;
      })()`,
    );
    if (clicked) return true;
    const paged = await clickSelector(win, ".page-dot:not(.is-current)");
    if (!paged) return false;
    await wait(350);
  }
  return false;
}

async function waitForStartGame(win) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const ready = await evaluate(
      win,
      `Array.from(document.querySelectorAll("button")).some((button) => button.textContent.trim() === "Start Game" && !button.disabled)`,
    );
    if (ready) return true;
    await wait(700);
  }
  return false;
}

async function snapshot(win, name) {
  let image;
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      image = await win.webContents.capturePage();
      break;
    } catch (error) {
      lastError = error;
      await wait(700);
    }
  }
  if (!image) throw lastError;
  const file = path.join(outDir, `${name}.png`);
  fs.writeFileSync(file, image.toPNG());
  return path.relative(root, file);
}

async function readState(win) {
  return evaluate(
    win,
    `(() => {
      const scroll = {
        bodyOverflowX: document.body.scrollWidth > window.innerWidth + 2,
        bodyOverflowY: document.body.scrollHeight > window.innerHeight + 2,
        rootOverflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
        rootOverflowY: document.documentElement.scrollHeight > window.innerHeight + 2,
      };
      const labels = Array.from(document.querySelectorAll(".hub-tile strong, .game-tile strong, .control-button, .instruction-panel")).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent.trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          scrollWidth: el.scrollWidth,
          scrollHeight: el.scrollHeight,
          overflow: el.scrollWidth > rect.width + 6 || el.scrollHeight > rect.height + 6,
        };
      });
      const images = Array.from(document.images).map((img) => ({
        src: img.currentSrc || img.src,
        width: img.naturalWidth,
        height: img.naturalHeight,
        visibleWidth: Math.round(img.getBoundingClientRect().width),
        visibleHeight: Math.round(img.getBoundingClientRect().height),
      }));
      return {
        title: document.querySelector("h1")?.textContent?.trim() || "",
        instruction: document.querySelector(".instruction-panel")?.textContent?.trim() || "",
        settingsOpen: !!document.querySelector(".settings-panel"),
        scroll,
        overflowingLabels: labels.filter((label) => label.overflow),
        brokenImages: images.filter((img) => img.src.includes("/assets/") && (!img.width || !img.height)),
        visibleImageCount: images.filter((img) => img.visibleWidth > 20 && img.visibleHeight > 20).length,
      };
    })()`,
  );
}

async function run() {
  await app.whenReady();
  const report = {
    target,
    generatedAt: new Date().toISOString(),
    sizes: [],
    areas: [],
    routes: [],
  };

  for (const [width, height] of sizes) {
    const win = new BrowserWindow({
      width,
      height,
      show: false,
      webPreferences: { autoplayPolicy: "no-user-gesture-required" },
    });
    await win.loadURL(target);
    await wait(900);
    if (width === 1920 && height === 1080) report.splashShot = await snapshot(win, "splash-1920x1080");
    const started = await enterHome(win);
    const state = await readState(win);
    const shot = await snapshot(win, `home-${width}x${height}`);
    report.sizes.push({ width, height, started, shot, state });
    win.close();
  }

  const routeChecks = [
    { area: "Literacy", game: "CVC Build Tray", screenshot: "literacy-cvc" },
    { area: "Literacy", game: "Long A Match", screenshot: "literacy-long-vowel" },
    { area: "Literacy", game: "Sight Word Snack Grab", screenshot: "literacy-sight-word" },
    { area: "Literacy", game: "Opinion Builder", screenshot: "literacy-opinion" },
    { area: "Literacy", game: "Context Clue Match", screenshot: "literacy-context" },
    { area: "Math", game: "Number Parking Lot", screenshot: "math-number-parking" },
    { area: "Math", game: "Shape Hunt", screenshot: "math-shape-hunt" },
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

  const capturedAreas = new Set();

  for (const check of routeChecks) {
    const win = new BrowserWindow({
      width: 1366,
      height: 768,
      show: false,
      webPreferences: { autoplayPolicy: "no-user-gesture-required" },
    });
    await win.loadURL(target);
    await wait(900);
    await enterHome(win);
    await clickByText(win, check.area);
    await wait(700);
    const areaState = await readState(win);
    if (!capturedAreas.has(check.area)) {
      const areaShot = await snapshot(win, `area-${check.area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`);
      report.areas.push({ area: check.area, shot: areaShot, state: areaState });
      capturedAreas.add(check.area);
    }
    const clicked = await clickGameWithPaging(win, check.game);
    await wait(900);
    const modelState = await readState(win);
    const modelShot = await snapshot(win, `${check.screenshot}-model`);
    await waitForStartGame(win);
    await clickByText(win, "Start Game");
    await wait(900);
    const gameState = await readState(win);
    const shot = await snapshot(win, check.screenshot);
    const backClicked = await clickByText(win, "Back to Area");
    await wait(500);
    const backState = await readState(win);
    report.routes.push({ ...check, clicked, backClicked, modelShot, shot, areaState, modelState, gameState, backState });
    win.close();
  }

  const debugWin = new BrowserWindow({
    width: 1366,
    height: 768,
    show: false,
    webPreferences: { autoplayPolicy: "no-user-gesture-required" },
  });
  await debugWin.loadURL(target);
  await wait(900);
  await enterHome(debugWin);
  await clickSelector(debugWin, "[data-testid='settings-button']");
  await wait(500);
  report.settingsState = await readState(debugWin);
  report.settingsShot = await snapshot(debugWin, "settings-panel");
  debugWin.close();

  const outPath = path.join(root, "docs", "ELECTRON_QA_CURRENT.json");
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    target,
    sizes: report.sizes.length,
    areas: report.areas.map((area) => ({ area: area.area, shot: area.shot })),
    routes: report.routes.map((route) => ({ area: route.area, game: route.game, clicked: route.clicked, backClicked: route.backClicked, shot: route.shot })),
    settingsOpen: report.settingsState.settingsOpen,
    report: path.relative(root, outPath),
  }, null, 2));
  app.quit();
}

run().catch((error) => {
  console.error(error);
  app.exit(1);
});
