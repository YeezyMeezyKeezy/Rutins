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
      .select("*, rutina(nombre_rutina, tiporutina(nombre_tiporutina))")
      .eq("id_usuario", idUsuario)
      .eq("completada_ejecucion", true)
      .gte("fecha_ejecucion", inicio.toISOString());

    if (error) throw new Error(error.message);
    const rows = ejecuciones || [];

    const { data: historial, error: errorHistorial } = await supabase
      .from("ejecucion")
      .select("fecha_ejecucion")
      .eq("id_usuario", idUsuario)
      .eq("completada_ejecucion", true);

    if (errorHistorial) throw new Error(errorHistorial.message);
    const rachas = rachaDesdeFechas(
      (historial || []).map((e) => e.fecha_ejecucion),
    );

    const dias = new Set(
      rows.map((e) => String(e.fecha_ejecucion).slice(0, 10)),
    );
    const tiempoTotal = rows.reduce(
      (s, e) => s + (parseInt(e.tiempo_total, 10) || 0),
      0,
    );

    const porRutina = {};
    const porTipo = { Ejercicio: 0, Hábitos: 0, Estudio: 0 };

    rows.forEach((e) => {
      const name = e.rutina?.nombre_rutina || "Sin nombre";
      const segundos = parseInt(e.tiempo_total, 10) || 0;
      if (!porRutina[name]) porRutina[name] = { veces: 0, segundos: 0 };
      porRutina[name].veces += 1;
      porRutina[name].segundos += segundos;

      const tipo = e.rutina?.tiporutina?.nombre_tiporutina || "";
      if (tipo.toLowerCase().includes("ejercicio")) porTipo.Ejercicio += 1;
      else if (
        tipo.toLowerCase().includes("hábito") ||
        tipo.toLowerCase().includes("habito")
      ) {
        porTipo.Hábitos += 1;
      } else if (tipo.toLowerCase().includes("estudio")) porTipo.Estudio += 1;
    });

    const semanas = [0, 0, 0, 0];
    rows.forEach((e) => {
      const diff = Math.floor(
        (new Date(e.fecha_ejecucion) - inicio) / 86400000,
      );
      semanas[Math.min(3, Math.max(0, Math.floor(diff / 7)))]++;
    });

    const masRealizada = Object.entries(porRutina).sort(
      (a, b) => b[1].veces - a[1].veces,
    )[0];

    const fmt = (d) => d.toLocaleDateString("es-ES");
    return {
      usuario: perfil?.nombre_usuario || "Usuario",
      periodo: `${fmt(inicio)} - ${fmt(fin)}`,
      completadas: rows.length,
      dias: dias.size,
      tiempo: this.formatDuration(tiempoTotal),
      rachaActual: rachas.actual,
      mejorRacha: rachas.mejor,
      semanas,
      porRutina,
      porTipo,
      resumen: armarResumen(rows.length, dias.size, masRealizada),
    };
  }

  html(data) {
    const maxSem = Math.max(...(data.semanas || [0]), 1);
    const barras = (data.semanas || [])
      .map((n, i) => {
        const alto = n === 0 ? 6 : Math.max(18, Math.round((n / maxSem) * 110));
        return `
        <div class="bar-col">
          <span class="bar-value">${n}</span>
          <div class="bar ${n === 0 ? "empty" : ""}" style="height:${alto}px"></div>
          <span class="bar-label">Semana ${i + 1}</span>
        </div>`;
      })
      .join("");

    const totalTipo =
      Object.values(data.porTipo || {}).reduce((s, n) => s + n, 0) || 1;
    const tipos = Object.entries(data.porTipo || {})
      .map(([nombre, n]) => {
        const pct = Math.round((n / totalTipo) * 100);
        return `
        <div class="tipo">
          <div class="tipo-top"><span>${nombre}</span><strong>${pct}%</strong></div>
          <div class="track"><div class="fill" style="width:${pct}%"></div></div>
          <span class="tipo-sub">${n} sesiones</span>
        </div>`;
      })
      .join("");

    const rutinas = Object.entries(data.porRutina || {})
      .map(
        ([nombre, info]) =>
          `<tr><td>${escapar(nombre)}</td><td>${info.veces}</td><td>${this.formatDuration(info.segundos)}</td></tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Rutins</title>
  <style>
    body { font-family: Arial, sans-serif; color: #2b2426; margin: 0; }
    .page { padding: 28px 32px 36px; }
    .head { border-bottom: 3px solid #8b2131; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { color: #8b2131; margin: 0; font-size: 28px; letter-spacing: 0.4px; }
    .muted { color: #7a6a6d; margin: 4px 0 0; font-size: 13px; }
    .user { margin: 14px 0 0; font-size: 14px; }
    .cards { display: flex; gap: 8px; margin: 16px 0 8px; }
    .card { flex: 1; background: #faf6f6; border-radius: 8px; padding: 10px 12px; }
    .card span { display: block; color: #7a6a6d; font-size: 11px; margin-bottom: 4px; }
    .card strong { color: #8b2131; font-size: 20px; }
    h2 { color: #3d1a22; font-size: 15px; margin: 22px 0 10px; }
    .chart-box { background: #faf6f6; border-radius: 8px; padding: 12px 12px 8px; }
    .chart { display: flex; align-items: flex-end; justify-content: space-around; height: 150px; }
    .bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 72px; }
    .bar { width: 34px; background: #8b2131; border-radius: 6px 6px 2px 2px; }
    .bar.empty { background: #e4d6d8; }
    .bar-value { font-size: 11px; color: #7a6a6d; margin-bottom: 4px; }
    .bar-label { font-size: 11px; color: #7a6a6d; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #8b2131; color: white; font-weight: 600; }
    th, td { padding: 8px 10px; text-align: left; font-size: 13px; }
    tr:nth-child(even) td { background: #faf6f6; }
    .tipos { display: flex; flex-direction: column; gap: 10px; }
    .tipo-top { display: flex; justify-content: space-between; font-size: 13px; }
    .track { height: 8px; background: #f0e6e8; border-radius: 99px; margin-top: 4px; }
    .fill { height: 8px; background: #8b2131; border-radius: 99px; }
    .tipo-sub { color: #7a6a6d; font-size: 11px; }
    .resumen { background: #faf6f6; border-left: 3px solid #8b2131; border-radius: 0 8px 8px 0; padding: 12px 14px; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="page">
    <div class="head">
      <h1>Rutins</h1>
      <p class="muted">Reporte de progreso · ${data.periodo}</p>
      <p class="user"><strong>Usuario:</strong> ${escapar(data.usuario)}</p>
    </div>
    <div class="cards">
      <div class="card"><span>Completadas</span><strong>${data.completadas}</strong></div>
      <div class="card"><span>Días activos</span><strong>${data.dias}</strong></div>
      <div class="card"><span>Tiempo</span><strong>${data.tiempo}</strong></div>
      <div class="card"><span>Racha actual</span><strong>${data.rachaActual}</strong></div>
      <div class="card"><span>Mejor racha</span><strong>${data.mejorRacha}</strong></div>
    </div>
    <h2>Evolución semanal</h2>
    <div class="chart-box"><div class="chart">${barras}</div></div>
    <h2>Tiempo por rutina</h2>
    <table>
      <tr><th>Rutina</th><th>Sesiones</th><th>Tiempo</th></tr>
      ${rutinas || "<tr><td colspan='3'>Sin rutinas en el periodo</td></tr>"}
    </table>
    <h2>Tipos de rutina</h2>
    <div class="tipos">${tipos}</div>
    <h2>Resumen del periodo</h2>
    <p class="resumen">${escapar(data.resumen)}</p>
  </div>
</body>
</html>`;
  }
}

function armarResumen(completadas, dias, masRealizada) {
  if (!completadas) return "Durante el período no se completó ninguna rutina.";
  const diaTxt =
    dias === 1 ? "1 día de actividad" : `${dias} días de actividad`;
  let texto = `Durante el período se completaron ${completadas} rutinas en ${diaTxt}.`;
  if (masRealizada) {
    texto += ` La rutina ${masRealizada[0]} fue la más realizada, con ${masRealizada[1].veces} sesiones.`;
  }
  return texto;
}

function rachaDesdeFechas(fechas) {
  const dias = [...new Set(fechas.map((f) => String(f).slice(0, 10)))].sort();
  if (!dias.length) return { actual: 0, mejor: 0 };

  let mejor = 1;
  let corrida = 1;
  for (let i = 1; i < dias.length; i++) {
    corrida = diferenciaDias(dias[i - 1], dias[i]) === 1 ? corrida + 1 : 1;
    if (corrida > mejor) mejor = corrida;
  }

  const hoy = fechaLocal();
  const ayer = diaAnterior(hoy);
  const ultima = dias[dias.length - 1];
  if (ultima !== hoy && ultima !== ayer) return { actual: 0, mejor };

  let actual = 1;
  for (let i = dias.length - 1; i > 0; i--) {
    if (diferenciaDias(dias[i - 1], dias[i]) !== 1) break;
    actual++;
  }
  return { actual, mejor };
}

function fechaLocal(d = new Date()) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diaAnterior(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() - 1);
  return fechaLocal(fecha);
}

function diferenciaDias(a, b) {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round(
    (new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da)) / 86400000,
  );
}

function escapar(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = Reporte;
