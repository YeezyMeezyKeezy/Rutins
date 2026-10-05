const { ipcMain } = require("electron");
const Ejecucion = require("../models/Ejecucion");

const ejecucion = new Ejecucion();

ipcMain.handle("ejecucion:crear", async (event, datos) => {
  try {
    const id = await ejecucion.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear ejecución:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ejecucion:obtenerPorFecha", async (event, idUsuario, fecha) => {
  try {
    const data = await ejecucion.obtenerPorFecha(idUsuario, fecha);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener ejecuciones por fecha:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("ejecucion:obtenerPorRutina", async (event, idRutina) => {
  try {
    const data = await ejecucion.obtenerPorRutina(idRutina);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener ejecuciones por rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle(
  "ejecucion:obtenerUltimas",
  async (event, idUsuario, dias = 30) => {
    try {
      const data = await ejecucion.obtenerUltimas(idUsuario, dias);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener últimas ejecuciones:", error);
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("ejecucion:actualizar", async (event, id, datos) => {
  try {
    const changes = await ejecucion.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar ejecución:", error);
    return { success: false, error: error.message };
  }
});
