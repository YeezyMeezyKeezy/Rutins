const { ipcMain } = require("electron");
const Auth = require("../models/Auth");

const auth = new Auth();

ipcMain.handle("auth:registrar", async (event, datos) => {
  try {
    return await auth.registrar(datos);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:iniciar", async (event, datos) => {
  try {
    return await auth.iniciar(datos);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:cerrar", async () => {
  try {
    return await auth.cerrar();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:recuperar", async (event, datos) => {
  try {
    return await auth.recuperar(datos);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:restaurar", async (event, tokens) => {
  try {
    return await auth.restaurar(tokens.access_token, tokens.refresh_token);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:actualizarNombre", async (event, nombre) => {
  try {
    return await auth.actualizarNombre(nombre);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("auth:cambiarClave", async (event, clave) => {
  try {
    return await auth.cambiarClave(clave);
  } catch (error) {
    return { success: false, error: error.message };
  }
});
