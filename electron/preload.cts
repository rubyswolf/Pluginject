import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("overlay", {
   openOverlayWindow: () => ipcRenderer.invoke("overlay:open"),
   closeOverlayWindow: () => ipcRenderer.invoke("overlay:close"),
});
