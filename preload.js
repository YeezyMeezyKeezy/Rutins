const { contextBridge, ipcRenderer } = require("electron");

// ============================================
// PUENTE SEGURO (Context Bridge)
// ============================================

contextBridge.exposeInMainWorld("api", {
  // ============================================
  // USUARIO
  // ============================================

  usuario: {
    crear: async (datos) => {
      return ipcRenderer.invoke("usuario:crear", datos);
    },
    obtener: async (id) => {
      return ipcRenderer.invoke("usuario:obtener", id);
    },
    obtenerPorEmail: async (email) => {
      return ipcRenderer.invoke("usuario:obtenerPorEmail", email);
    },
    actualizar: async (id, datos) => {
      return ipcRenderer.invoke("usuario:actualizar", id, datos);
    },
    eliminar: async (id) => {
      return ipcRenderer.invoke("usuario:eliminar", id);
    },
  },

  // ============================================
  // TIPO RUTINA
  // ============================================

  tiporutina: {
    obtenerTodas: async () => {
      return ipcRenderer.invoke("tiporutina:obtenerTodas");
    },
  },

  // ============================================
  // RUTINA
  // ============================================

  rutina: {
    crear: async (datos) => {
      return ipcRenderer.invoke("rutina:crear", datos);
    },
    obtenerTodas: async (idUsuario) => {
      return ipcRenderer.invoke("rutina:obtenerTodas", idUsuario);
    },
    obtener: async (id) => {
      return ipcRenderer.invoke("rutina:obtener", id);
    },
    actualizar: async (id, datos) => {
      return ipcRenderer.invoke("rutina:actualizar", id, datos);
    },
    eliminar: async (id) => {
      return ipcRenderer.invoke("rutina:eliminar", id);
    },
  },

  // ============================================
  // ACTIVIDAD
  // ============================================

  actividad: {
    crear: async (datos) => {
      return ipcRenderer.invoke("actividad:crear", datos);
    },
    obtenerPorRutina: async (idRutina) => {
      return ipcRenderer.invoke("actividad:obtenerPorRutina", idRutina);
    },
    actualizar: async (id, datos) => {
      return ipcRenderer.invoke("actividad:actualizar", id, datos);
    },
    eliminar: async (id) => {
      return ipcRenderer.invoke("actividad:eliminar", id);
    },
  },

  // ============================================
  // EJECUCIÓN
  // ============================================

  ejecucion: {
    crear: async (datos) => {
      return ipcRenderer.invoke("ejecucion:crear", datos);
    },
    obtenerPorFecha: async (idUsuario, fecha) => {
      return ipcRenderer.invoke("ejecucion:obtenerPorFecha", idUsuario, fecha);
    },
    obtenerPorRutina: async (idRutina) => {
      return ipcRenderer.invoke("ejecucion:obtenerPorRutina", idRutina);
    },
    obtenerUltimas: async (idUsuario, dias = 30) => {
      return ipcRenderer.invoke("ejecucion:obtenerUltimas", idUsuario, dias);
    },
    actualizar: async (id, datos) => {
      return ipcRenderer.invoke("ejecucion:actualizar", id, datos);
    },
  },

  // ============================================
  // PROGRESO
  // ============================================

  progreso: {
    obtener: async (idUsuario) => {
      return ipcRenderer.invoke("progreso:obtener", idUsuario);
    },
    crearOActualizar: async (idUsuario, datos) => {
      return ipcRenderer.invoke("progreso:crearOActualizar", idUsuario, datos);
    },
    actualizar: async (idUsuario, datos) => {
      return ipcRenderer.invoke("progreso:actualizar", idUsuario, datos);
    },
  },

  //============================================
  // CUENTA
  // ============================================

  cuenta: {
    exportar: async (idUsuario) => {
      return ipcRenderer.invoke("cuenta:exportar", idUsuario);
    },
    importar: async () => {
      return ipcRenderer.invoke("cuenta:importar");
    },
  },

  //============================================
  // REPORTES
  // ============================================

  reporte: {
    generar: async (idUsuario) =>
      ipcRenderer.invoke("reporte:generar", idUsuario),
  },
});
