const db = require("../database/db");

function crear(datos) {
  return db.insert("usuario", {
    nombre_usuario: datos.nombre_usuario,
    email_usuario: datos.email_usuario,
    clave_usuario: datos.clave_usuario,
    fecharegisto_usuario: new Date().toISOString(),
    fechaultimoacceso_usuario: new Date().toISOString(),
  });
}

function obtener(id) {
  return db.selectOne("SELECT * FROM usuario WHERE id_usuario = ?", [id]);
}

function obtenerPorEmail(email) {
  return db.selectOne("SELECT * FROM usuario WHERE email_usuario = ?", [email]);
}

function actualizar(id, datos) {
  const updates = [];
  const values = [];

  if (datos.nombre_usuario !== undefined) {
    updates.push("nombre_usuario = ?");
    values.push(datos.nombre_usuario);
  }
  if (datos.email_usuario !== undefined) {
    updates.push("email_usuario = ?");
    values.push(datos.email_usuario);
  }
  if (datos.clave_usuario !== undefined) {
    updates.push("clave_usuario = ?");
    values.push(datos.clave_usuario);
  }

  updates.push("fechaultimoacceso_usuario = ?");
  values.push(new Date().toISOString());
  values.push(id);

  if (updates.length === 1) {
  }

  const query = `UPDATE usuario SET ${updates.join(", ")} WHERE id_usuario = ?`;
  return db.update(query, values);
}

function eliminar(id) {
  const changes = db.deleteRows("DELETE FROM usuario WHERE id_usuario = ?", [
    id,
  ]);

  if (changes === 0) {
    return { success: false, error: "Usuario no encontrado" };
  }

  return { success: true };
}

module.exports = {
  crear,
  obtener,
  obtenerPorEmail,
  actualizar,
  eliminar,
};
