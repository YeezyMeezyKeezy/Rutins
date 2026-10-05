const { ipcMain } = require("electron");
const Usuario = require("../models/Usuario");

const usuario = new Usuario();

ipcMain.handle("usuario:obtener", async (event, id) => {
  try {
    const data = await usuario.obtener(id);
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:actualizar", async (event, id, datos) => {
  try {
    const changes = await usuario.actualizar(id, datos);
    return { success: true, changes };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("usuario:eliminar", async () => {
  try {
    return await usuario.eliminar();
  } catch (error) {
    console.error("Error en usuario:eliminar:", error);
    return { success: false, error: error.message };
  }
});