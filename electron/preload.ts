import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("overlay", {
   enterFullscreen: () => ipcRenderer.send("overlay:fullscreen", true),
   exitFullscreen: () => ipcRenderer.send("overlay:fullscreen", false),
});
