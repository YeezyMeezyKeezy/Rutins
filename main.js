const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const db = require("./src/database/db");

// Importar todos los handlers
require("./ipcHandlers");

let mainWindow;

// ============================================
// CREAR VENTANA PRINCIPAL
// ============================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    /*icon: path.join(__dirname, 'assets/icon.png')*/
  });

  mainWindow.loadFile(path.join(__dirname, "src/views/login.html"));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ============================================
// INICIAR APLICACIÓN
// ============================================

app.on("ready", () => {
  db.initializeDatabase();
  createWindow();
  createMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("quit", () => {
  db.closeDatabase();
});

// ============================================
// MENÚ DE LA APLICACIÓN
// ============================================

function createMenu() {
  const template = [
    {
      label: "Archivo",
      submenu: [
        {
          label: "Salir",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { label: "Deshacer", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        {
          label: "Rehacer",
          accelerator: "Shift+CmdOrCtrl+Z",
          selector: "redo:",
        },
        { type: "separator" },
        { label: "Cortar", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copiar", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Pegar", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      ],
    },
    {
      label: "Ver",
      submenu: [
        {
          label: "Recargar",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            mainWindow.reload();
          },
        },
        {
          label: "DevTools",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => {
            mainWindow.webContents.openDevTools();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
