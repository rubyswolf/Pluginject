import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
   mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         preload: path.join(__dirname, "preload.js"),
      },
   });

   if (process.env.NODE_ENV === "development") {
      await mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools();
   } else {
      await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
   }
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
   if (process.platform !== "darwin") app.quit();
});
