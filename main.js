const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const isDev = require("electron-is-dev");

require("dotenv").config();
const { supabase } = require("./src/database/supabase");

// Importar todos los handlers
require("./ipcHandlers");

async function probarSupabase() {
  const { data, error } = await supabase.from("tiporutina").select("*");
  if (error) {
    console.error("Supabase error:", error.message);
    return;
  }
  console.log("Supabase OK. Tipos:", data);
}

probarSupabase();

let mainWindow;

// ============================================
// PÁGINA DE RECUPERAR CONTRASEÑA (localhost:3000)
// ============================================

function servirRecuperacion() {
  const htmlPath = path.join(__dirname, "src/views/recuperar.html");
  const cssPath = path.join(__dirname, "src/styles/recuperar.css");
  const iconPath = path.join(__dirname, "assets/js/lucide.min.js");
  const iconFile = path.join(__dirname, "assets/icons/RutinsFondo.png");

  const server = http.createServer((req, res) => {
    const ruta = req.url.split("?")[0];

    if (ruta === "/recuperar.css") {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(fs.readFileSync(cssPath));
      return;
    }

    if (ruta === "/lucide.min.js") {
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
      res.end(fs.readFileSync(iconPath));
      return;
    }

    if (ruta === "/RutinsFondo.png") {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(fs.readFileSync(iconFile));
      return;
    }

    if (ruta === "/recuperar") {
      const html = fs
        .readFileSync(htmlPath, "utf8")
        .replace("__SUPABASE_URL__", process.env.SUPABASE_URL)
        .replace("__SUPABASE_ANON_KEY__", process.env.SUPABASE_ANON_KEY);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    res.writeHead(404);
    res.end("No encontrado");
  });

  server.listen(3000, "127.0.0.1");
}

// ============================================
// CREAR VENTANA PRINCIPAL
// ============================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, "assets/icons/RutinsFondo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
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
  servirRecuperacion();
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
