const db = require("../database/db");

function crear(datos) {
  return db.insert("rutina", {
    id_usuario: datos.id_usuario,
    nombre_rutina: datos.nombre_rutina,
    descripcion_rutina: datos.descripcion_rutina || null,
    id_tiporutina: datos.id_tiporutina,
    frecuencia_rutina: datos.frecuencia_rutina,
    fechacreacion_rutina: new Date().toISOString(),
    activa: datos.activa !== undefined ? datos.activa : 1,
  });
}

function obtenerTodas(idUsuario) {
  return db.selectAll(
    `SELECT r.*, t.nombre_tiporutina 
     FROM rutina r 
     LEFT JOIN tiporutina t ON r.id_tiporutina = t.id_tiporutina
     WHERE r.id_usuario = ? 
     ORDER BY r.fechacreacion_rutina DESC`,
    [idUsuario],
  );
}

function obtener(id) {
  return db.selectOne(
    `SELECT r.*, t.nombre_tiporutina 
     FROM rutina r 
     LEFT JOIN tiporutina t ON r.id_tiporutina = t.id_tiporutina
     WHERE r.id_rutina = ?`,
    [id],
  );
}

function actualizar(id, datos) {
  const updates = [];
  const values = [];

  if (datos.nombre_rutina !== undefined) {
    updates.push("nombre_rutina = ?");
    values.push(datos.nombre_rutina);
  }
  if (datos.descripcion_rutina !== undefined) {
    updates.push("descripcion_rutina = ?");
    values.push(datos.descripcion_rutina);
  }
  if (datos.id_tiporutina !== undefined) {
    updates.push("id_tiporutina = ?");
    values.push(datos.id_tiporutina);
  }
  if (datos.frecuencia_rutina !== undefined) {
    updates.push("frecuencia_rutina = ?");
    values.push(datos.frecuencia_rutina);
  }
  if (datos.activa !== undefined) {
    updates.push("activa = ?");
    values.push(datos.activa);
  }

  values.push(id);
  const query = `UPDATE rutina SET ${updates.join(", ")} WHERE id_rutina = ?`;
  return db.update(query, values);
}

function eliminar(id) {
  return db.deleteRows("DELETE FROM rutina WHERE id_rutina = ?", [id]);
}

function obtenerTipos() {
  return db.selectAll("SELECT * FROM tiporutina ORDER BY nombre_tiporutina");
}

module.exports = {
  crear,
  obtenerTodas,
  obtener,
  actualizar,
  eliminar,
  obtenerTipos,
};
