import { app, BrowserWindow, Tray, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ESM shim for __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isQuitting = false;
const isDev = !app.isPackaged;
const trayPath = isDev
   ? path.join(__dirname, "../../build/icon.ico")
   : path.join(process.resourcesPath, "icon.ico");

// Acquire single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
   // Another instance is running — exit this one
   app.quit();
} else {
   // Keep a reference to the main window so we can focus/restore it later
   let win: BrowserWindow | null = null;
   let tray: Tray | null = null;

   function createWindow() {
      win = new BrowserWindow({
         width: 1000,
         height: 700,
         webPreferences: {
            preload: path.join(__dirname, "preload.js"),
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

      win.on("close", (event) => {
         if (!isQuitting) {
            event.preventDefault();
            win?.hide();
         }
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
      tray = new Tray(trayPath);

      const trayMenu = Menu.buildFromTemplate([
         {
            label: "Show",
            click: () => {
               if (win) {
                  win.show();
                  win.focus();
               }
            },
         },
         {
            label: "Quit",
            click: () => {
               isQuitting = true;
               app.quit();
            },
         },
      ]);

      tray.setToolTip("Pluginject");
      tray.setContextMenu(trayMenu);

      tray.on("click", () => {
         // restore on single-click
         if (win) {
            win.show();
            win.focus();
         }
      });

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
