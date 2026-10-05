const { ipcMain, dialog, BrowserWindow } = require("electron");
const fs = require("fs");

require("./src/controllers/usuarioController");
require("./src/controllers/rutinaController");
require("./src/controllers/actividadController");
require("./src/controllers/ejecucionController");
require("./src/controllers/progresoController");
require("./src/controllers/authController");
require("./src/controllers/reporteController");
require("./src/controllers/cuentaController");