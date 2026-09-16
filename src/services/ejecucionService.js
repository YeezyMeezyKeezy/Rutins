const db = require("../database/db");

function crear(datos) {
  return db.insert("ejecucion", {
    id_rutina: datos.id_rutina,
    id_usuario: datos.id_usuario,
    fecha_ejecucion: datos.fecha_ejecucion || new Date().toISOString(),
    completada_ejecucion: datos.completada_ejecucion || 0,
    tiempo_total: datos.tiempo_total || null,
  });
}

function obtenerPorFecha(idUsuario, fecha) {
  return db.selectAll(
    `SELECT e.*, r.nombre_rutina 
     FROM ejecucion e 
     LEFT JOIN rutina r ON e.id_rutina = r.id_rutina
     WHERE e.id_usuario = ? 
     AND DATE(e.fecha_ejecucion) = ?
     ORDER BY e.fecha_ejecucion DESC`,
    [idUsuario, fecha],
  );
}

function obtenerPorRutina(idRutina) {
  return db.selectAll(
    "SELECT * FROM ejecucion WHERE id_rutina = ? ORDER BY fecha_ejecucion DESC",
    [idRutina],
  );
}

function obtenerUltimas(idUsuario, dias = 30) {
  return db.selectAll(
    `SELECT e.*, r.nombre_rutina 
     FROM ejecucion e 
     LEFT JOIN rutina r ON e.id_rutina = r.id_rutina
     WHERE e.id_usuario = ? 
     AND e.fecha_ejecucion >= datetime('now', '-' || ? || ' days')
     ORDER BY e.fecha_ejecucion DESC`,
    [idUsuario, dias],
  );
}

function actualizar(id, datos) {
  const updates = [];
  const values = [];

  if (datos.completada_ejecucion !== undefined) {
    updates.push("completada_ejecucion = ?");
    values.push(datos.completada_ejecucion);
  }
  if (datos.tiempo_total !== undefined) {
    updates.push("tiempo_total = ?");
    values.push(datos.tiempo_total);
  }

  values.push(id);
  const query = `UPDATE ejecucion SET ${updates.join(", ")} WHERE id_ejecucion = ?`;
  return db.update(query, values);
}

module.exports = {
  crear,
  obtenerPorFecha,
  obtenerPorRutina,
  obtenerUltimas,
  actualizar,
};
