const db = require("../database/db");

function exportar(idUsuario) {
  const usuario = db.selectOne("SELECT * FROM usuario WHERE id_usuario = ?", [
    idUsuario,
  ]);
  const rutinas = db.selectAll("SELECT * FROM rutina WHERE id_usuario = ?", [
    idUsuario,
  ]);
  const ids = rutinas.map((r) => r.id_rutina);
  const actividades = ids.length
    ? db.selectAll(
        `SELECT * FROM actividad WHERE id_rutina IN (${ids.map(() => "?").join(",")})`,
        ids,
      )
    : [];
  const ejecuciones = db.selectAll(
    "SELECT * FROM ejecucion WHERE id_usuario = ?",
    [idUsuario],
  );
  const progreso = db.selectOne("SELECT * FROM progreso WHERE id_usuario = ?", [
    idUsuario,
  ]);

  return {
    app: "Rutins",
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    usuario,
    rutinas,
    actividades,
    ejecuciones,
    progreso,
  };
}

function importar(payload) {
  if (!payload || payload.app !== "Rutins") {
    return { success: false, error: "Archivo no válido de Rutins" };
  }

  const usuario = payload.usuario;
  const rutinas = payload.rutinas || [];
  const actividades = payload.actividades || [];
  const ejecuciones = payload.ejecuciones || [];
  const progreso = payload.progreso || null;

  if (!usuario || !usuario.email_usuario) {
    return { success: false, error: "El archivo no incluye un usuario" };
  }

  return db.transaction(() => {
    const existente = db.selectOne(
      "SELECT id_usuario FROM usuario WHERE email_usuario = ?",
      [usuario.email_usuario],
    );

    // CASCADE borra rutinas actividades ejecuciones y progreso
    if (existente) {
      db.deleteRows("DELETE FROM usuario WHERE id_usuario = ?", [
        existente.id_usuario,
      ]);
    }

    const nuevoId = db.insert("usuario", {
      nombre_usuario: usuario.nombre_usuario,
      email_usuario: usuario.email_usuario,
      clave_usuario: usuario.clave_usuario,
      fecharegisto_usuario:
        usuario.fecharegisto_usuario || new Date().toISOString(),
      fechaultimoacceso_usuario: new Date().toISOString(),
    });

    const mapaRutinas = {};
    for (const r of rutinas) {
      const newRid = db.insert("rutina", {
        id_usuario: nuevoId,
        nombre_rutina: r.nombre_rutina,
        descripcion_rutina: r.descripcion_rutina,
        id_tiporutina: r.id_tiporutina,
        frecuencia_rutina: r.frecuencia_rutina,
        fechacreacion_rutina: r.fechacreacion_rutina,
        activa: r.activa,
      });
      mapaRutinas[r.id_rutina] = newRid;
    }

    for (const a of actividades) {
      const newR = mapaRutinas[a.id_rutina];
      if (!newR) continue;
      db.insert("actividad", {
        id_rutina: newR,
        nombre_actividad: a.nombre_actividad,
        orden_actividad: a.orden_actividad,
        repeticiones_actividad: a.repeticiones_actividad,
        duracion_actividad: a.duracion_actividad,
        descanso_actividad: a.descanso_actividad,
      });
    }

    for (const e of ejecuciones) {
      const newR = mapaRutinas[e.id_rutina];
      if (!newR) continue;
      db.insert("ejecucion", {
        id_rutina: newR,
        id_usuario: nuevoId,
        fecha_ejecucion: e.fecha_ejecucion,
        completada_ejecucion: e.completada_ejecucion,
        tiempo_total: e.tiempo_total,
      });
    }

    if (progreso) {
      db.insert("progreso", {
        id_usuario: nuevoId,
        fecharegistro_progreso: progreso.fecharegistro_progreso,
        rutinascompletadas_progreso: progreso.rutinascompletadas_progreso || 0,
        porcentaje_progreso: progreso.porcentaje_progreso || 0,
        racha_progreso: progreso.racha_progreso || 0,
      });
    }

    return {
      success: true,
      id_usuario: nuevoId,
      nombre_usuario: usuario.nombre_usuario,
      email_usuario: usuario.email_usuario,
    };
  });
}

module.exports = {
  exportar,
  importar,
};
