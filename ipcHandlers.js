const { ipcMain, dialog, BrowserWindow } = require("electron");
const fs = require("fs");

const usuarioService = require("./src/services/usuarioService");
const rutinaService = require("./src/services/rutinaService");
const actividadService = require("./src/services/actividadService");
const ejecucionService = require("./src/services/ejecucionService");
const progresoService = require("./src/services/progresoService");
const cuentaService = require("./src/services/cuentaService");
const reporteService = require("./src/services/reporteService");

// ============================================
// USUARIO
// ============================================

ipcMain.handle("usuario:crear", async (event, datos) => {
  try {
    const id = usuarioService.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:obtener", async (event, id) => {
  try {
    const usuario = usuarioService.obtener(id);
    return { success: true, data: usuario };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:obtenerPorEmail", async (event, email) => {
  try {
    const usuario = usuarioService.obtenerPorEmail(email);
    return { success: true, data: usuario };
  } catch (error) {
    console.error("Error al obtener usuario por email:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:actualizar", async (event, id, datos) => {
  try {
    const changes = usuarioService.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:eliminar", async (event, id) => {
  try {
    return usuarioService.eliminar(id);
  } catch (error) {
    console.error("Error en usuario:eliminar:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// TIPO RUTINA
// ============================================

ipcMain.handle("tiporutina:obtenerTodas", async () => {
  try {
    const tipos = rutinaService.obtenerTipos();
    return { success: true, data: tipos };
  } catch (error) {
    console.error("Error al obtener tipos de rutina:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// RUTINA
// ============================================

ipcMain.handle("rutina:crear", async (event, datos) => {
  try {
    const id = rutinaService.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:obtenerTodas", async (event, idUsuario) => {
  try {
    const rutinas = rutinaService.obtenerTodas(idUsuario);
    return { success: true, data: rutinas };
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:obtener", async (event, id) => {
  try {
    const rutina = rutinaService.obtener(id);
    return { success: true, data: rutina };
  } catch (error) {
    console.error("Error al obtener rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:actualizar", async (event, id, datos) => {
  try {
    const changes = rutinaService.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:eliminar", async (event, id) => {
  try {
    const changes = rutinaService.eliminar(id);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al eliminar rutina:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// ACTIVIDAD
// ============================================

ipcMain.handle("actividad:crear", async (event, datos) => {
  try {
    const id = actividadService.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear actividad:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:obtenerPorRutina", async (event, idRutina) => {
  try {
    const actividades = actividadService.obtenerPorRutina(idRutina);
    return { success: true, data: actividades };
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:actualizar", async (event, id, datos) => {
  try {
    const changes = actividadService.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar actividad:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:eliminar", async (event, id) => {
  try {
    const changes = actividadService.eliminar(id);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// EJECUCIÓN
// ============================================

ipcMain.handle("ejecucion:crear", async (event, datos) => {
  try {
    const id = ejecucionService.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear ejecución:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ejecucion:obtenerPorFecha", async (event, idUsuario, fecha) => {
  try {
    const ejecuciones = ejecucionService.obtenerPorFecha(idUsuario, fecha);
    return { success: true, data: ejecuciones };
  } catch (error) {
    console.error("Error al obtener ejecuciones por fecha:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ejecucion:obtenerPorRutina", async (event, idRutina) => {
  try {
    const ejecuciones = ejecucionService.obtenerPorRutina(idRutina);
    return { success: true, data: ejecuciones };
  } catch (error) {
    console.error("Error al obtener ejecuciones por rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "ejecucion:obtenerUltimas",
  async (event, idUsuario, dias = 30) => {
    try {
      const ejecuciones = ejecucionService.obtenerUltimas(idUsuario, dias);
      return { success: true, data: ejecuciones };
    } catch (error) {
      console.error("Error al obtener últimas ejecuciones:", error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("ejecucion:actualizar", async (event, id, datos) => {
  try {
    const changes = ejecucionService.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar ejecución:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// PROGRESO
// ============================================

ipcMain.handle("progreso:obtener", async (event, idUsuario) => {
  try {
    const progreso = progresoService.obtener(idUsuario);
    return { success: true, data: progreso };
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("progreso:crearOActualizar", async (event, idUsuario, datos) => {
  try {
    const result = progresoService.crearOActualizar(idUsuario, datos);
    return { success: true, ...result };
  } catch (error) {
    console.error("Error al crear/actualizar progreso:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("progreso:actualizar", async (event, idUsuario, datos) => {
  try {
    const changes = progresoService.actualizar(idUsuario, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// CUENTA
// ============================================

ipcMain.handle("cuenta:exportar", async (event, idUsuario) => {
  try {
    const payload = cuentaService.exportar(idUsuario);
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Exportar cuenta Rutins",
      defaultPath: "cuenta-rutins.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    return { success: true, filePath };
  } catch (error) {
    console.error("Error exportando cuenta:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("cuenta:importar", async (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: "Importar cuenta Rutins",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (canceled || !filePaths?.[0]) {
      return { success: false, canceled: true };
    }

    const payload = JSON.parse(fs.readFileSync(filePaths[0], "utf-8"));
    return cuentaService.importar(payload);
  } catch (error) {
    console.error("Error importando cuenta:", error);
    return { success: false, error: error.message };
  }
});

// ============================================
// REPORTES
// ============================================

ipcMain.handle("reporte:generar", async (event, idUsuario) => {
  try {
    const data = reporteService.construir(idUsuario);
    const html = reporteService.html(data);
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Guardar reporte",
      defaultPath: "reporte-rutins.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (canceled || !filePath) return { success: false, canceled: true };

    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: { offscreen: true },
    });
    await pdfWin.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(html),
    );
    const pdf = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
    });
    pdfWin.close();
    fs.writeFileSync(filePath, pdf);
    return { success: true, filePath };
  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, error: error.message };
  }
});
