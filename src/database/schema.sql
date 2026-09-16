PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tiporutina (
  id_tiporutina INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_tiporutina VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_usuario VARCHAR(100) NOT NULL,
  email_usuario VARCHAR(100) NOT NULL UNIQUE,
  clave_usuario VARCHAR(255) NOT NULL,
  fecharegisto_usuario DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaultimoacceso_usuario DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS rutina (
  id_rutina INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL,
  nombre_rutina VARCHAR(100) NOT NULL,
  descripcion_rutina TEXT DEFAULT NULL,
  id_tiporutina INTEGER NOT NULL,
  frecuencia_rutina VARCHAR(20) NOT NULL,
  fechacreacion_rutina DATETIME DEFAULT CURRENT_TIMESTAMP,
  activa TINYINT DEFAULT 1,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_tiporutina) REFERENCES tiporutina(id_tiporutina)
);

CREATE TABLE IF NOT EXISTS actividad (
  id_actividad INTEGER PRIMARY KEY AUTOINCREMENT,
  id_rutina INTEGER NOT NULL,
  nombre_actividad VARCHAR(100) NOT NULL,
  orden_actividad INTEGER NOT NULL,
  repeticiones_actividad INTEGER DEFAULT NULL,
  duracion_actividad INTEGER DEFAULT NULL,
  descanso_actividad INTEGER DEFAULT 60,
  FOREIGN KEY (id_rutina) REFERENCES rutina(id_rutina) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ejecucion (
  id_ejecucion INTEGER PRIMARY KEY AUTOINCREMENT,
  id_rutina INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  fecha_ejecucion DATETIME NOT NULL,
  completada_ejecucion TINYINT DEFAULT 0,
  tiempo_total INTEGER DEFAULT NULL,
  FOREIGN KEY (id_rutina) REFERENCES rutina(id_rutina) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progreso (
  id_progreso INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER NOT NULL UNIQUE,
  fecharegistro_progreso DATE NOT NULL,
  rutinascompletadas_progreso INTEGER DEFAULT 0,
  porcentaje_progreso DECIMAL(5,2) DEFAULT 0.00,
  racha_progreso INTEGER DEFAULT 0,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email_usuario);
CREATE INDEX IF NOT EXISTS idx_rutina_tiporutina ON rutina(id_tiporutina);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso(id_usuario);
CREATE INDEX IF NOT EXISTS idx_rutina_usuario ON rutina(id_usuario);
CREATE INDEX IF NOT EXISTS idx_rutina_fechacreacion ON rutina(fechacreacion_rutina);
CREATE INDEX IF NOT EXISTS idx_actividad_rutina ON actividad(id_rutina);
CREATE INDEX IF NOT EXISTS idx_actividad_orden ON actividad(orden_actividad);
CREATE INDEX IF NOT EXISTS idx_ejecucion_rutina ON ejecucion(id_rutina);
CREATE INDEX IF NOT EXISTS idx_ejecucion_fecha ON ejecucion(fecha_ejecucion);
CREATE INDEX IF NOT EXISTS idx_ejecucion_usuario_fecha ON ejecucion(id_usuario, fecha_ejecucion);

INSERT OR IGNORE INTO tiporutina (nombre_tiporutina) VALUES ('Habitos');
INSERT OR IGNORE INTO tiporutina (nombre_tiporutina) VALUES ('Ejercicio');
INSERT OR IGNORE INTO tiporutina (nombre_tiporutina) VALUES ('Estudio');