const db = require("../database/db");

function obtener(idUsuario) {
  return db.selectOne("SELECT * FROM progreso WHERE id_usuario = ?", [
    idUsuario,
  ]);
}

function crearOActualizar(idUsuario, datos) {
  const progresoExistente = db.selectOne(
    "SELECT * FROM progreso WHERE id_usuario = ?",
    [idUsuario],
  );

  if (progresoExistente) {
    const changes = db.update(
      `UPDATE progreso 
       SET fecharegistro_progreso = ?, 
           rutinascompletadas_progreso = ?, 
           porcentaje_progreso = ?, 
           racha_progreso = ? 
       WHERE id_usuario = ?`,
      [
        datos.fecharegistro_progreso || new Date().toISOString().split("T")[0],
        datos.rutinascompletadas_progreso || 0,
        datos.porcentaje_progreso || 0,
        datos.racha_progreso || 0,
        idUsuario,
      ],
    );
    return { action: "updated", changes };
  }

  const id = db.insert("progreso", {
    id_usuario: idUsuario,
    fecharegistro_progreso:
      datos.fecharegistro_progreso || new Date().toISOString().split("T")[0],
    rutinascompletadas_progreso: datos.rutinascompletadas_progreso || 0,
    porcentaje_progreso: datos.porcentaje_progreso || 0,
    racha_progreso: datos.racha_progreso || 0,
  });
  return { action: "created", id };
}

function actualizar(idUsuario, datos) {
  const updates = [];
  const values = [];

  if (datos.fecharegistro_progreso !== undefined) {
    updates.push("fecharegistro_progreso = ?");
    values.push(datos.fecharegistro_progreso);
  }
  if (datos.rutinascompletadas_progreso !== undefined) {
    updates.push("rutinascompletadas_progreso = ?");
    values.push(datos.rutinascompletadas_progreso);
  }
  if (datos.porcentaje_progreso !== undefined) {
    updates.push("porcentaje_progreso = ?");
    values.push(datos.porcentaje_progreso);
  }
  if (datos.racha_progreso !== undefined) {
    updates.push("racha_progreso = ?");
    values.push(datos.racha_progreso);
  }

  values.push(idUsuario);
  const query = `UPDATE progreso SET ${updates.join(", ")} WHERE id_usuario = ?`;
  return db.update(query, values);
}

module.exports = {
  obtener,
  crearOActualizar,
  actualizar,
};
