import { app, BrowserWindow, Tray, Menu, ipcMain, screen } from "electron";
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
   let overlayWin: BrowserWindow | null = null;
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

   const createOverlayWindow = () => {
      if (overlayWin) {
         overlayWin.show();
         overlayWin.focus();
         return;
      }

      const { bounds } = screen.getPrimaryDisplay();

      overlayWin = new BrowserWindow({
         transparent: true,
         frame: false,
         fullscreenable: false,
         x: bounds.x,
         y: bounds.y,
         width: bounds.width,
         height: bounds.height,
         resizable: false,
         movable: false,
         skipTaskbar: true,
         alwaysOnTop: true,
         hasShadow: false,
         backgroundColor: "#00000000",
         webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
         },
      });

      overlayWin.setAlwaysOnTop(true, "screen-saver");
      overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      overlayWin.on("ready-to-show", () => {
         overlayWin?.show();
         overlayWin?.focus();
      });

      if (isDev) {
         overlayWin.loadURL("http://localhost:5173/?overlay=1");
      } else {
         overlayWin.loadFile(path.join(__dirname, "../frontend/index.html"), { search: "overlay=1" });
      }

      overlayWin.on("closed", () => {
         overlayWin = null;
      });
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
         frame: false,
         backgroundColor: "#0f1012",
         title: "Pluginject",
         webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
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

      win.on("maximize", () => {
         win?.webContents.send("window:maximize-changed", true);
      });

      win.on("unmaximize", () => {
         win?.webContents.send("window:maximize-changed", false);
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
      // Remove the default application menu.
      Menu.setApplicationMenu(null);

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

      ipcMain.handle("overlay:open", () => {
         createOverlayWindow();
      });

      ipcMain.handle("overlay:close", () => {
         // Hide instead of closing so sounds can finish playing inside the overlay window.
         overlayWin?.hide();
      });

      ipcMain.handle("window:minimize", () => {
         win?.minimize();
      });

      ipcMain.handle("window:toggle-maximize", () => {
         if (!win) return false;
         if (win.isMaximized()) {
            win.unmaximize();
            return false;
         }
         win.maximize();
         return true;
      });

      ipcMain.handle("window:is-maximized", () => {
         return win?.isMaximized() ?? false;
      });

      ipcMain.handle("window:close", () => {
         // Mimic previous behavior of hiding instead of quitting.
         win?.hide();
      });

      ipcMain.handle("devtools:toggle", () => {
         if (!isDev) return;
         const target = BrowserWindow.getFocusedWindow() ?? win ?? overlayWin ?? BrowserWindow.getAllWindows()[0];
         target?.webContents.toggleDevTools();
      });

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

   app.on("will-quit", () => {
      // noop
   });
}
