const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("learningTownDesktop", {
  getDisplayInfo: () => ipcRenderer.invoke("learning-town:get-display-info"),
  getWindowBounds: () => ipcRenderer.invoke("learning-town:get-window-bounds"),
  setWindowSize: (width, height) => ipcRenderer.invoke("learning-town:set-window-size", { width, height }),
  setWindowBounds: (bounds) => ipcRenderer.invoke("learning-town:set-window-bounds", bounds)
});
