import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("overlay", {
   openOverlayWindow: () => ipcRenderer.invoke("overlay:open"),
   closeOverlayWindow: () => ipcRenderer.invoke("overlay:close"),
});

contextBridge.exposeInMainWorld("windowControls", {
   minimize: () => ipcRenderer.invoke("window:minimize"),
   toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
   isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
   close: () => ipcRenderer.invoke("window:close"),
   onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      const listener = (_event: unknown, isMaximized: boolean) => callback(isMaximized);
      ipcRenderer.on("window:maximize-changed", listener);
      return () => ipcRenderer.removeListener("window:maximize-changed", listener);
   },
});

contextBridge.exposeInMainWorld("devtools", {
   toggle: () => ipcRenderer.invoke("devtools:toggle"),
});
