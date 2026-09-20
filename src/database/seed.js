function seedDatabase(db) {
  const totalUsuarios = db
    .prepare("SELECT COUNT(*) AS total FROM usuario")
    .get().total;

  if (totalUsuarios === 0) {
    db.prepare(`
      INSERT INTO usuario (nombre_usuario, email_usuario, clave_usuario)
      VALUES (?, ?, ?)
    `).run("Angelo", "angelo@rutins.local", "123456");
  }

  const totalRutinas = db
    .prepare("SELECT COUNT(*) AS total FROM rutina")
    .get().total;

  if (totalRutinas > 0) {
    return;
  }

  const usuario = db.prepare("SELECT id_usuario FROM usuario LIMIT 1").get();
  const tipoHabitos = db
    .prepare("SELECT id_tiporutina FROM tiporutina WHERE nombre_tiporutina = ?")
    .get("Habitos");
  const tipoEjercicio = db
    .prepare("SELECT id_tiporutina FROM tiporutina WHERE nombre_tiporutina = ?")
    .get("Ejercicio");
  const tipoEstudio = db
    .prepare("SELECT id_tiporutina FROM tiporutina WHERE nombre_tiporutina = ?")
    .get("Estudio");

  if (!usuario || !tipoHabitos || !tipoEjercicio || !tipoEstudio) {
    console.warn("seed.js: faltan usuario o tipos de rutina");
    return;
  }

  const insertarRutina = db.prepare(`
    INSERT INTO rutina (
      id_usuario,
      nombre_rutina,
      descripcion_rutina,
      id_tiporutina,
      frecuencia_rutina,
      activa
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const rutinaEjercicio = insertarRutina.run(
    usuario.id_usuario,
    "Pecho y triceps",
    "Rutina de fuerza, 3 series",
    tipoEjercicio.id_tiporutina,
    "3 veces por semana",
    1
  );

  const rutinaHabito = insertarRutina.run(
    usuario.id_usuario,
    "Leer 20 minutos",
    "Habito diario de lectura",
    tipoHabitos.id_tiporutina,
    "Diaria",
    1
  );

  const rutinaEstudio = insertarRutina.run(
    usuario.id_usuario,
    "Repaso SENA",
    "Estudio de evidencias y apuntes",
    tipoEstudio.id_tiporutina,
    "Diaria",
    1
  );

  const insertarActividad = db.prepare(`
    INSERT INTO actividad (
      id_rutina,
      nombre_actividad,
      orden_actividad,
      repeticiones_actividad,
      duracion_actividad,
      descanso_actividad
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertarActividad.run(rutinaEjercicio.lastInsertRowid, "Press banca", 1, 12, null, 60);
  insertarActividad.run(rutinaEjercicio.lastInsertRowid, "Fondos", 2, 10, null, 60);
  insertarActividad.run(rutinaHabito.lastInsertRowid, "Leer", 1, null, 20, 0);
  insertarActividad.run(rutinaEstudio.lastInsertRowid, "Repasar apuntes", 1, null, 30, 0);

  console.log("✅ Seed: usuario, rutinas y actividades de ejemplo insertados");
}

module.exports = { seedDatabase };