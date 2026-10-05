const { ipcMain } = require("electron");
const Actividad = require("../models/Actividad");

const actividad = new Actividad();

ipcMain.handle("actividad:crear", async (event, datos) => {
  try {
    const id = await actividad.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear actividad:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:obtenerPorRutina", async (event, idRutina) => {
  try {
    const data = await actividad.obtenerPorRutina(idRutina);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:actualizar", async (event, id, datos) => {
  try {
    const changes = await actividad.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar actividad:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("actividad:eliminar", async (event, id) => {
  try {
    const changes = await actividad.eliminar(id);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al eliminar actividad:", error);
    return { success: false, error: error.message };
  }
});