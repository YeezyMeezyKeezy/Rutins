const { ipcMain } = require("electron");
const Progreso = require("../models/Progreso");

const progreso = new Progreso();

ipcMain.handle("progreso:obtener", async (event, idUsuario) => {
  try {
    const data = await progreso.obtener(idUsuario);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("progreso:crearOActualizar", async (event, idUsuario, datos) => {
  try {
    const data = await progreso.crearOActualizar(idUsuario, datos);
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear/actualizar progreso:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("progreso:actualizar", async (event, idUsuario, datos) => {
  try {
    const changes = await progreso.actualizar(idUsuario, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    return { success: false, error: error.message };
  }
});