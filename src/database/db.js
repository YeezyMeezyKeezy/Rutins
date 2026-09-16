// ============================================
// DATABASE MODULE - db.js
// ============================================
// Módulo para gestionar todas las operaciones
// con SQLite en Rutins
// ============================================

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// ============================================
// CONFIGURACIÓN
// ============================================

// En desarrollo: carpeta del proyecto
// En producción: carpeta de datos del usuario
const isDev = require("electron-is-dev");
const dbDir = isDev
  ? path.join(__dirname, "data")
  : path.join(process.env.APPDATA || process.env.HOME, "Rutins", "data");

const dbPath = path.join(dbDir, "rutins.db");

// Crear carpeta si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`📊 Base de datos en: ${dbPath}`);

// ============================================
// INICIALIZAR BASE DE DATOS
// ============================================

let db;

/**
 * Inicializa la conexión a SQLite y crea las tablas si no existen
 */
function initializeDatabase() {
  try {
    // Crear/conectar a la base de datos
    db = new Database(dbPath);

    // Configurar SQLite
    db.pragma("journal_mode = WAL"); // Modo de escritura más seguro
    db.pragma("foreign_keys = ON"); // Activar restricciones de clave foránea

    console.log("✅ Conexión a SQLite establecida");

    // Leer y ejecutar schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    db.exec(schema);
    console.log("✅ Tablas de base de datos creadas/verificadas");

    return true;
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error);
    return false;
  }
}

/**
 * Obtiene la instancia actual de la base de datos
 */
function getDatabase() {
  if (!db) {
    throw new Error(
      "Base de datos no inicializada. Ejecuta initializeDatabase() primero.",
    );
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDatabase() {
  if (db) {
    db.close();
    console.log("✅ Conexión a SQLite cerrada");
  }
}

// ============================================
// OPERACIONES GENÉRICAS
// ============================================

/**
 * Ejecuta un INSERT y retorna el ID generado
 * @param {string} table - Nombre de la tabla
 * @param {object} data - Objeto con los datos a insertar
 * @returns {number} ID de la fila insertada
 */
function insert(table, data) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => "?").join(", ");

  const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

  const stmt = db.prepare(query);
  const result = stmt.run(...values);

  return result.lastInsertRowid;
}

/**
 * Obtiene una fila de la base de datos
 * @param {string} query - Consulta SQL
 * @param {array} params - Parámetros para la consulta
 * @returns {object} Fila encontrada o undefined
 */
function selectOne(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.get(...params);
}

/**
 * Obtiene múltiples filas de la base de datos
 * @param {string} query - Consulta SQL
 * @param {array} params - Parámetros para la consulta
 * @returns {array} Array de filas
 */
function selectAll(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

/**
 * Actualiza filas en la base de datos
 * @param {string} query - Consulta UPDATE
 * @param {array} params - Parámetros para la consulta
 * @returns {number} Número de filas actualizadas
 */
function update(query, params = []) {
  const stmt = db.prepare(query);
  const result = stmt.run(...params);
  return result.changes;
}

/**
 * Elimina filas de la base de datos
 * @param {string} query - Consulta DELETE
 * @param {array} params - Parámetros para la consulta
 * @returns {number} Número de filas eliminadas
 */
function deleteRows(query, params = []) {
  const stmt = db.prepare(query);
  const result = stmt.run(...params);
  return result.changes;
}

/**
 * Ejecuta una transacción
 * @param {function} callback - Función que ejecuta las operaciones
 */
function transaction(callback) {
  const trans = db.transaction(callback);
  return trans();
}

// ============================================
// EXPORTAR MÓDULO
// ============================================

module.exports = {
  // Inicialización
  initializeDatabase,
  getDatabase,
  closeDatabase,

  // Operaciones genéricas
  insert,
  selectOne,
  selectAll,
  update,
  deleteRows,
  transaction,

  // Path
  dbPath,
};
