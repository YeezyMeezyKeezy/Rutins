const db = require("../database/db");

function crear(datos) {
  return db.insert("actividad", {
    id_rutina: datos.id_rutina,
    nombre_actividad: datos.nombre_actividad,
    orden_actividad: datos.orden_actividad,
    repeticiones_actividad: datos.repeticiones_actividad || null,
    duracion_actividad: datos.duracion_actividad || null,
    descanso_actividad: datos.descanso_actividad || 60,
  });
}

function obtenerPorRutina(idRutina) {
  return db.selectAll(
    "SELECT * FROM actividad WHERE id_rutina = ? ORDER BY orden_actividad",
    [idRutina],
  );
}

function actualizar(id, datos) {
  const updates = [];
  const values = [];

  if (datos.nombre_actividad !== undefined) {
    updates.push("nombre_actividad = ?");
    values.push(datos.nombre_actividad);
  }
  if (datos.orden_actividad !== undefined) {
    updates.push("orden_actividad = ?");
    values.push(datos.orden_actividad);
  }
  if (datos.repeticiones_actividad !== undefined) {
    updates.push("repeticiones_actividad = ?");
    values.push(datos.repeticiones_actividad);
  }
  if (datos.duracion_actividad !== undefined) {
    updates.push("duracion_actividad = ?");
    values.push(datos.duracion_actividad);
  }
  if (datos.descanso_actividad !== undefined) {
    updates.push("descanso_actividad = ?");
    values.push(datos.descanso_actividad);
  }

  values.push(id);
  const query = `UPDATE actividad SET ${updates.join(", ")} WHERE id_actividad = ?`;
  return db.update(query, values);
}

function eliminar(id) {
  return db.deleteRows("DELETE FROM actividad WHERE id_actividad = ?", [id]);
}

module.exports = {
  crear,
  obtenerPorRutina,
  actualizar,
  eliminar,
};
