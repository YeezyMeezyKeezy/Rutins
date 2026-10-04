const { supabase } = require("../database/supabase");

function formatDuration(totalSec) {
  const sec = parseInt(totalSec, 10) || 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0 && m === 0) return `${sec} s`;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function bar(pct) {
  const filled = Math.round(pct / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

async function construir(idUsuario) {
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

  const dias = new Set(rows.map((e) => String(e.fecha_ejecucion).slice(0, 10)));
  const tiempoTotal = rows.reduce((s, e) => s + (parseInt(e.tiempo_total, 10) || 0), 0);

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
    const diff = Math.floor((new Date(e.fecha_ejecucion) - inicio) / 86400000);
    semanas[Math.min(3, Math.max(0, Math.floor(diff / 7)))]++;
  });
  const maxSem = Math.max(...semanas, 1);

  const fmt = (d) => d.toLocaleDateString("es-ES");
  return {
    usuario: perfil?.nombre_usuario || "Usuario",
    periodo: `${fmt(inicio)} - ${fmt(fin)}`,
    completadas: rows.length,
    dias: dias.size,
    tiempo: formatDuration(tiempoTotal),
    ejercicios,
    semanasPct: semanas.map((n) => Math.round((n / maxSem) * 100)),
    porRutina,
    observaciones:
      rows.length >= 8
        ? "El usuario mantuvo una frecuencia constante durante el periodo."
        : rows.length
          ? "Hay actividad registrada. Conviene mantener la constancia semana a semana."
          : "Aún no hay suficiente actividad en el periodo.",
    bar,
  };
}

module.exports = { construir, formatDuration, bar };