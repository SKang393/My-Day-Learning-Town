const { app, BrowserWindow, ipcMain, net, protocol, screen, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const scheme = "learning-town";

protocol.registerSchemesAsPrivileged([
  {
    scheme,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true
    }
  }
]);

function appRoot() {
  return app.getAppPath();
}

function safeDistPath(requestUrl) {
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname || "/");
  if (pathname === "/") pathname = "/index.html";
  const distRoot = path.join(appRoot(), "dist");
  const candidate = path.normalize(path.join(distRoot, pathname));
  if (!candidate.startsWith(distRoot)) return path.join(distRoot, "index.html");
  return candidate;
}

async function registerAppProtocol() {
  protocol.handle(scheme, (request) => {
    const filePath = safeDistPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#eef8ef",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`${scheme}://`)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`${scheme}://`)) event.preventDefault();
  });

  win.loadURL(`${scheme}://app/index.html`);
}

function windowForEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

function centerBounds(width, height, workArea) {
  return {
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + (workArea.height - height) / 2),
    width,
    height
  };
}

ipcMain.handle("learning-town:get-display-info", (event) => {
  const win = windowForEvent(event);
  const bounds = win?.getBounds() ?? screen.getPrimaryDisplay().workArea;
  const display = screen.getDisplayMatching(bounds);
  return {
    workArea: display.workArea,
    bounds: display.bounds,
    scaleFactor: display.scaleFactor
  };
});

ipcMain.handle("learning-town:get-window-bounds", (event) => {
  const win = windowForEvent(event);
  return win?.getBounds() ?? { x: 0, y: 0, width: 1366, height: 768 };
});

ipcMain.handle("learning-town:set-window-size", (event, size) => {
  const win = windowForEvent(event);
  if (!win) return { ok: false };
  if (win.isMaximized()) win.unmaximize();
  const width = Math.max(1024, Math.round(Number(size.width)));
  const height = Math.max(700, Math.round(Number(size.height)));
  const display = screen.getDisplayMatching(win.getBounds());
  const nextBounds = centerBounds(width, height, display.workArea);
  win.setBounds(nextBounds, true);
  return { ok: true, previousBounds: win.getBounds(), workArea: display.workArea };
});

ipcMain.handle("learning-town:set-window-bounds", (event, bounds) => {
  const win = windowForEvent(event);
  if (!win) return { ok: false };
  if (win.isMaximized()) win.unmaximize();
  win.setBounds({
    x: Math.round(Number(bounds.x)),
    y: Math.round(Number(bounds.y)),
    width: Math.max(1024, Math.round(Number(bounds.width))),
    height: Math.max(700, Math.round(Number(bounds.height)))
  }, true);
  return { ok: true, bounds: win.getBounds() };
});

app.whenReady().then(async () => {
  await registerAppProtocol();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
