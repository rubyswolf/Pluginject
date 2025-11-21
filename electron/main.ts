import { app, BrowserWindow, Tray, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// ESM shim for __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginjectProtocol = "pluginject";
const startDeepLink = `${pluginjectProtocol}://start`;

let isQuitting = false;
const isDev = !app.isPackaged;
const devTrayPath = path.join(__dirname, "../../build/icon.ico");

// Acquire single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
   // Another instance is running - exit this one
   app.quit();
} else {
   // Keep a reference to the main window so we can focus/restore it later
   let win: BrowserWindow | null = null;
   let tray: Tray | null = null;
   let initialDeepLink = "";

   const getDeepLinkFromArgv = (argv: string[]) =>
      argv.find((arg) => arg.toLowerCase().startsWith(`${pluginjectProtocol}://`));

   const handleDeepLink = (url?: string) => {
      if (!url) return;

      const normalized = url.toLowerCase().trim();
      if (normalized === startDeepLink) {
         if (!win) {
            createWindow();
         } else {
            win.show();
            win.focus();
         }
      }
   };

   function createWindow() {
      if (win) {
         win.show();
         win.focus();
         return;
      }

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
   app.on("second-instance", (_event, argv) => {
      const url = getDeepLinkFromArgv(argv);

      if (url) {
         handleDeepLink(url);
         return;
      }

      if (win) {
         if (win.isMinimized()) win.restore();
         win.focus();
      }
   });

   app.whenReady().then(() => {
      // Register the custom protocol so links like pluginject://start open the app.
      if (isDev && process.defaultApp) {
         app.setAsDefaultProtocolClient(pluginjectProtocol, process.execPath, [path.resolve(process.argv[1])]);
      } else {
         app.setAsDefaultProtocolClient(pluginjectProtocol);
      }

      // Capture any deep link passed to the first instance (Windows).
      initialDeepLink = getDeepLinkFromArgv(process.argv) ?? "";

      app.on("open-url", (event, url) => {
         event.preventDefault();
         handleDeepLink(url);
      });

      const trayPath = isDev ? devTrayPath : path.join(app.getAppPath(), "build", "icon.ico");
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

      if (initialDeepLink) {
         handleDeepLink(initialDeepLink);
      }

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
