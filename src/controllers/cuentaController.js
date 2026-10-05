const { ipcMain, dialog, BrowserWindow } = require("electron");
const fs = require("fs");
const Cuenta = require("../models/Cuenta");

const cuenta = new Cuenta();

ipcMain.handle("cuenta:exportar", async (event, idUsuario) => {
  try {
    const payload = await cuenta.exportar(idUsuario);
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Exportar rutinas",
      defaultPath: "rutinas-rutins.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    return { success: true, filePath };
  } catch (error) {
    console.error("Error exportando rutinas:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("cuenta:importar", async (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: "Importar rutinas Rutins",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (canceled || !filePaths?.[0]) {
      return { success: false, canceled: true };
    }

    const payload = JSON.parse(fs.readFileSync(filePaths[0], "utf-8"));
    return await cuenta.importar(payload);
  } catch (error) {
    console.error("Error importando cuenta:", error);
    return { success: false, error: error.message };
  }
});