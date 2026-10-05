const { supabase } = require("../database/supabase");

class Reporte {
  formatDuration(totalSec) {
    const sec = parseInt(totalSec, 10) || 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h === 0 && m === 0) return `${sec} s`;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  bar(pct) {
    const filled = Math.round(pct / 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
  }

  async construir(idUsuario) {
    const { data: perfil } = await supabase
      .from("perfil")
      .select("*")
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(fin.getDate() - 29);

    const { data: ejecuciones, error } = await supabase
      .from("ejecucion")
      .select("*, rutina(nombre_rutina)")
      .eq("id_usuario", idUsuario)
      .eq("completada_ejecucion", true)
      .gte("fecha_ejecucion", inicio.toISOString());

    if (error) throw new Error(error.message);
    const rows = ejecuciones || [];

    const dias = new Set(
      rows.map((e) => String(e.fecha_ejecucion).slice(0, 10)),
    );
    const tiempoTotal = rows.reduce(
      (s, e) => s + (parseInt(e.tiempo_total, 10) || 0),
      0,
    );

    let ejercicios = 0;
    for (const e of rows) {
      const { count } = await supabase
        .from("actividad")
        .select("id_actividad", { count: "exact", head: true })
        .eq("id_rutina", e.id_rutina);
      ejercicios += count || 0;
    }

    const porRutina = {};
    rows.forEach((e) => {
      const name = e.rutina?.nombre_rutina || "Sin nombre";
      porRutina[name] = (porRutina[name] || 0) + 1;
    });

    const semanas = [0, 0, 0, 0];
    rows.forEach((e) => {
      const diff = Math.floor(
        (new Date(e.fecha_ejecucion) - inicio) / 86400000,
      );
      semanas[Math.min(3, Math.max(0, Math.floor(diff / 7)))]++;
    });
    const maxSem = Math.max(...semanas, 1);

    const fmt = (d) => d.toLocaleDateString("es-ES");
    return {
      usuario: perfil?.nombre_usuario || "Usuario",
      periodo: `${fmt(inicio)} - ${fmt(fin)}`,
      completadas: rows.length,
      dias: dias.size,
      tiempo: this.formatDuration(tiempoTotal),
      ejercicios,
      semanasPct: semanas.map((n) => Math.round((n / maxSem) * 100)),
      porRutina,
      observaciones:
        rows.length >= 8
          ? "El usuario mantuvo una frecuencia constante durante el periodo."
          : rows.length
            ? "Hay actividad registrada. Conviene mantener la constancia semana a semana."
            : "Aún no hay suficiente actividad en el periodo.",
      bar: (pct) => this.bar(pct),
    };
  }

  html(data) {
    const filas = Object.entries(data.porRutina || {})
      .map(([nombre, veces]) => `<tr><td>${nombre}</td><td>${veces}</td></tr>`)
      .join("");

    const semanas = (data.semanasPct || [])
      .map((pct, i) => `<p>Semana ${i + 1}: ${data.bar(pct)} ${pct}%</p>`)
      .join("");

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Rutins</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f1f1f; margin: 32px; }
    h1 { color: #8b2131; margin-bottom: 4px; }
    .muted { color: #5c5c5c; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e4d6d8; padding: 8px; text-align: left; }
    th { background: #8b2131; color: white; }
  </style>
</head>
<body>
  <h1>Rutins</h1>
  <p class="muted">Reporte de progreso · ${data.periodo}</p>
  <p><strong>Usuario:</strong> ${data.usuario}</p>
  <p><strong>Rutinas completadas:</strong> ${data.completadas}</p>
  <p><strong>Días con actividad:</strong> ${data.dias}</p>
  <p><strong>Tiempo total:</strong> ${data.tiempo}</p>
  <p><strong>Actividades:</strong> ${data.ejercicios}</p>
  <h2>Semanas</h2>
  ${semanas}
  <h2>Por rutina</h2>
  <table>
    <tr><th>Rutina</th><th>Veces</th></tr>
    ${filas || "<tr><td colspan='2'>Sin rutinas en el periodo</td></tr>"}
  </table>
  <h2>Observaciones</h2>
  <p>${data.observaciones}</p>
</body>
</html>`;
  }
}

module.exports = Reporte;
