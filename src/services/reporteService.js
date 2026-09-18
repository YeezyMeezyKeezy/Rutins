const db = require("../database/db");

function formatDuration(totalSec) {
  const sec = parseInt(totalSec, 10) || 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0 && m === 0) return `${sec} s`;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function toLocalDateStr(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function bar(pct) {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function construir(idUsuario) {
  const usuario = db.selectOne("SELECT * FROM usuario WHERE id_usuario = ?", [
    idUsuario,
  ]);

  const fin = new Date();
  const inicio = new Date();
  inicio.setDate(fin.getDate() - 29);
  inicio.setHours(0, 0, 0, 0);

  const ejecuciones = db.selectAll(
    `SELECT e.*, r.nombre_rutina
     FROM ejecucion e
     LEFT JOIN rutina r ON e.id_rutina = r.id_rutina
     WHERE e.id_usuario = ?
       AND e.completada_ejecucion = 1
       AND e.fecha_ejecucion >= ?
     ORDER BY e.fecha_ejecucion ASC`,
    [idUsuario, inicio.toISOString()],
  );

  const dias = new Set(
    ejecuciones.map((e) => toLocalDateStr(e.fecha_ejecucion)),
  );
  const tiempoTotal = ejecuciones.reduce(
    (s, e) => s + (parseInt(e.tiempo_total, 10) || 0),
    0,
  );

  let ejercicios = 0;
  for (const e of ejecuciones) {
    const n = db.selectOne(
      "SELECT COUNT(*) AS n FROM actividad WHERE id_rutina = ?",
      [e.id_rutina],
    );
    ejercicios += n?.n || 0;
  }

  const porRutina = {};
  ejecuciones.forEach((e) => {
    const name = e.nombre_rutina || "Sin nombre";
    porRutina[name] = (porRutina[name] || 0) + 1;
  });

  const semanas = [0, 0, 0, 0];
  ejecuciones.forEach((e) => {
    const d = new Date(e.fecha_ejecucion);
    const diff = Math.floor((d - inicio) / (1000 * 60 * 60 * 24));
    const idx = Math.min(3, Math.floor(diff / 7));
    semanas[idx]++;
  });
  const maxSem = Math.max(...semanas, 1);
  const semanasPct = semanas.map((n) => Math.round((n / maxSem) * 100));

  let obs = "Aún no hay suficiente actividad en el periodo.";
  if (ejecuciones.length >= 8 && dias.size >= 5) {
    obs = "El usuario mantuvo una frecuencia constante durante el periodo.";
  } else if (ejecuciones.length > 0) {
    obs =
      "Hay actividad registrada. Conviene mantener la constancia semana a semana.";
  }

  const fmt = (d) => d.toLocaleDateString("es-ES");

  return {
    usuario: usuario?.nombre_usuario || "Usuario",
    periodo: `${fmt(inicio)} - ${fmt(fin)}`,
    completadas: ejecuciones.length,
    dias: dias.size,
    tiempo: formatDuration(tiempoTotal),
    ejercicios,
    semanasPct,
    porRutina,
    observaciones: obs,
  };
}

function html(data) {
  const semanas = data.semanasPct
    .map((p, i) => `Semana ${i + 1}:   ${bar(p)} ${p}%`)
    .join("\n");

  const rutinas =
    Object.entries(data.porRutina)
      .map(([n, c]) => `• ${n}       ${c} ${c === 1 ? "vez" : "veces"}`)
      .join("\n") || "• Sin rutinas en el periodo";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #12121f;
      padding: 48px 56px;
    }
    h1 { text-align: center; letter-spacing: 4px; margin: 0; color: #8b2131; }
    h2 { text-align: center; font-weight: 600; margin: 6px 0 28px; }
    .meta { margin-bottom: 8px; color: #5a5a7a; }
    hr { border: none; border-top: 1px solid #e4e4f0; margin: 16px 0; }
    h3 { font-size: 13px; letter-spacing: 1px; color: #8b2131; margin: 22px 0 8px; }
    pre { font-family: "Consolas", "Courier New", monospace; font-size: 13px; line-height: 1.6; }
    p { color: #5a5a7a; }
  </style>
</head>
<body>
  <h1>RUTINS</h1>
  <h2>REPORTE DE PROGRESO</h2>
  <div class="meta">Usuario: ${data.usuario}</div>
  <div class="meta">Periodo: ${data.periodo}</div>

  <h3>RESUMEN</h3>
  <hr />
  <pre>Rutinas completadas:       ${data.completadas}
Días de entrenamiento:     ${data.dias}
Tiempo total:              ${data.tiempo}
Ejercicios realizados:     ${data.ejercicios}</pre>

  <h3>PROGRESO</h3>
  <hr />
  <pre>${semanas}</pre>

  <h3>RUTINAS REALIZADAS</h3>
  <hr />
  <pre>${rutinas}</pre>

  <h3>OBSERVACIONES</h3>
  <hr />
  <p>${data.observaciones}</p>
</body>
</html>`;
}

module.exports = { construir, html };
