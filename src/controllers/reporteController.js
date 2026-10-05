const { ipcMain, dialog, BrowserWindow } = require("electron");
const fs = require("fs");
const Reporte = require("../models/Reporte");

const reporte = new Reporte();

ipcMain.handle("reporte:generar", async (event, idUsuario) => {
  try {
    const data = await reporte.construir(idUsuario);
    const html = reporte.html(data);
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
