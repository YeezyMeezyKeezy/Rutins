const { ipcMain } = require("electron");
const Rutina = require("../models/Rutina");

const rutina = new Rutina();

ipcMain.handle("tiporutina:obtenerTodas", async () => {
  try {
    const tipos = await rutina.obtenerTipos();
    return { success: true, data: tipos };
  } catch (error) {
    console.error("Error al obtener tipos de rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:crear", async (event, datos) => {
  try {
    const id = await rutina.crear(datos);
    return { success: true, id };
  } catch (error) {
    console.error("Error al crear rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:obtenerTodas", async (event, idUsuario) => {
  try {
    const rutinas = await rutina.obtenerTodas(idUsuario);
    return { success: true, data: rutinas };
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:obtener", async (event, id) => {
  try {
    const data = await rutina.obtener(id);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:actualizar", async (event, id, datos) => {
  try {
    const changes = await rutina.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar rutina:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("rutina:eliminar", async (event, id) => {
  try {
    const changes = await rutina.eliminar(id);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al eliminar rutina:", error);
    return { success: false, error: error.message };
  }
});