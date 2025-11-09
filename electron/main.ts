import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ESM shim for __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Acquire single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
   // Another instance is running — exit this one
   app.quit();
} else {
   // Keep a reference to the main window so we can focus/restore it later
   let win: BrowserWindow | null = null;

   const isDev = !app.isPackaged;

   function createWindow() {
      win = new BrowserWindow({
         width: 1000,
         height: 700,
         webPreferences: {
            preload: path.join(__dirname, "preload.js"), // now resolves correctly in dist/electron
         },
      });

      if (isDev) {
         win.loadURL("http://localhost:5173");
      } else {
         win.loadFile(path.join(__dirname, "../frontend/index.html")); // React output
      }

      win.on("closed", () => {
         win = null;
      });
   }

   // If a second instance is launched, focus/restore the existing window
   app.on("second-instance", () => {
      if (win) {
         if (win.isMinimized()) win.restore();
         win.focus();
      }
   });

   app.whenReady().then(() => {
      createWindow();

      app.on("activate", () => {
         // On macOS recreate a window when the dock icon is clicked and there are no other windows open.
         if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
   });

   // Quit when all windows are closed, except on macOS.
   app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
         app.quit();
      }
   });
}
