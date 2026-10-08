window.addEventListener("DOMContentLoaded", async () => {
  const raw =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");

  if (!raw) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(raw);

  if (user.access_token && user.refresh_token) {
    await window.api.auth.restaurar({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    });
  }

  initializeDashboard(user);
  await loadDashboardData(user);

  if (window.lucide) lucide.createIcons();
});

function initializeDashboard(user) {
  const firstName = user.nombre_usuario.split(" ")[0];
  const letter = firstName.charAt(0).toUpperCase();

  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");
  if (userAvatar) userAvatar.textContent = letter;
  if (userName) {
    userName.textContent =
      firstName +
      (user.nombre_usuario.includes(" ")
        ? " " + user.nombre_usuario.split(" ")[1]?.charAt(0) + "."
        : "");
  }

  const titleText = document.getElementById("topbar-title-text");
  if (titleText) {
    titleText.textContent = `Hola, ${firstName}`;
  }

  const profileAvatar = document.getElementById("profile-avatar");
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");

  if (profileAvatar) profileAvatar.textContent = letter;
  if (profileName) profileName.textContent = user.nombre_usuario;
  if (profileEmail) profileEmail.textContent = user.email_usuario;

  const today = new Date();
  const dayName = today.toLocaleDateString("es-ES", { weekday: "long" });
  const todayTitleText = document.getElementById("today-title-text");
  if (todayTitleText) {
    todayTitleText.textContent = `Hoy — ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
  }
}

function fechaLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function fechaDe(iso) {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function estaHecha(ejecucion) {
  return (
    ejecucion.completada_ejecucion === 1 ||
    ejecucion.completada_ejecucion === true
  );
}

function rutinasParaHoy(routines, ejecuciones) {
  const inicio = new Date();
  const dia = inicio.getDay();
  inicio.setDate(inicio.getDate() - (dia === 0 ? 6 : dia - 1));
  inicio.setHours(0, 0, 0, 0);

  const cupo = {
    Diaria: 7,
    "3 veces/semana": 3,
    "2 veces/semana": 2,
    "1 vez/semana": 1,
  };
  const diasPorRutina = {};

  for (const e of ejecuciones || []) {
    if (!estaHecha(e)) continue;
    if (new Date(e.fecha_ejecucion) < inicio) continue;
    const id = Number(e.id_rutina);
    if (!diasPorRutina[id]) diasPorRutina[id] = new Set();
    diasPorRutina[id].add(fechaDe(e.fecha_ejecucion));
  }

  return (routines || []).filter((r) => {
    if (!(r.activa === 1 || r.activa === true)) return false;
    const dias = diasPorRutina[Number(r.id_rutina)];
    const hechaHoy = dias?.has(fechaLocal()) || false;
    if (hechaHoy) return true;
    if (r.frecuencia_rutina === "Diaria") return true;
    const hechas = dias?.size || 0;
    return hechas < (cupo[r.frecuencia_rutina] ?? 7);
  });
}

async function loadDashboardData(user) {
  try {
    const today = fechaLocal();
    const [rutinasResult, weekResult, progresoResult] = await Promise.all([
      window.api.rutina.obtenerTodas(user.id_usuario),
      window.api.ejecucion.obtenerUltimas(user.id_usuario, 7),
      window.api.progreso.obtener(user.id_usuario),
    ]);

    const executionsWeek =
      weekResult.success && weekResult.data ? weekResult.data : [];

    if (rutinasResult.success && rutinasResult.data) {
      const routines = rutinasResult.data;
      const deHoy = rutinasParaHoy(routines, executionsWeek);

      const statTotal = document.getElementById("stat-total");
      if (statTotal) statTotal.textContent = routines.length;

      const badge = document.getElementById("routines-badge");
      if (badge && routines.length > 0) {
        badge.textContent = routines.length;
        badge.style.display = "inline";
      }

      const completedIds = new Set(
        executionsWeek
          .filter((e) => estaHecha(e) && fechaDe(e.fecha_ejecucion) === today)
          .map((e) => Number(e.id_rutina)),
      );
      const pending = deHoy.filter(
        (r) => !completedIds.has(Number(r.id_rutina)),
      ).length;
      const done = Math.max(0, deHoy.length - pending);

      const statToday = document.getElementById("stat-today");
      if (statToday) statToday.textContent = pending;

      const todaySubtitle = document.getElementById("today-subtitle");
      if (todaySubtitle) {
        if (deHoy.length === 0) {
          todaySubtitle.textContent = "No tienes rutinas programadas para hoy.";
        } else if (pending === 0) {
          todaySubtitle.textContent =
            "Ya completaste todas las rutinas de hoy. ¡Buen trabajo!";
        } else if (done === 0) {
          todaySubtitle.textContent = `Tienes ${pending} rutina${pending > 1 ? "s" : ""} programada${pending > 1 ? "s" : ""}. ¡Mantén el foco!`;
        } else {
          todaySubtitle.textContent = `Has completado ${done}. Te ${pending === 1 ? "falta" : "faltan"} ${pending} rutina${pending > 1 ? "s" : ""}.`;
        }
      }

      renderRoutineRows("dashboard-routines", deHoy, completedIds);
    }

    if (progresoResult.success && progresoResult.data) {
      const p = progresoResult.data;
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      setText("stat-streak", p.racha_progreso || 0);
      setText("stat-week", p.rutinascompletadas_progreso || 0);
    }
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}

function getTypeStyle(nombreTipo) {
  const t = (nombreTipo || "").toLowerCase();
  if (
    t.includes("ejercicio") ||
    t.includes("exercise") ||
    t.includes("workout")
  ) {
    return { icon: "dumbbell", chip: "", row: "", fill: "" };
  }
  if (
    t.includes("hábito") ||
    t.includes("habit") ||
    t.includes("lectura") ||
    t.includes("reading")
  ) {
    return { icon: "book-open", chip: "blue", row: "blue", fill: "blue" };
  }
  if (t.includes("estudio") || t.includes("study")) {
    return { icon: "library", chip: "green", row: "green", fill: "green" };
  }
  return { icon: "clipboard-list", chip: "", row: "", fill: "" };
}

function renderRoutineRows(containerId, routines, completedIds = new Set()) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!routines || routines.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><span data-lucide="inbox"></span></div>
        <div class="empty-title">Sin rutinas aún</div>
        <div class="empty-subtitle">Crea tu primera rutina para comenzar</div>
        <button class="btn-start" onclick="createRoutineModal()">
          <span data-lucide="plus"></span> Nueva Rutina
        </button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = routines
    .map((r) => {
      const style = getTypeStyle(r.nombre_tiporutina);
      const isDone = completedIds.has(Number(r.id_rutina));
      const statusClass = isDone ? "done" : "pending";
      const statusText = isDone ? "Completada" : "Pendiente";

      return `
      <div class="routine-row ${style.row}">
        <div class="routine-type-icon ${style.row || "red"}">
          <span data-lucide="${style.icon}"></span>
        </div>
        <div class="routine-info">
          <div class="routine-name">${r.nombre_rutina}</div>
          ${r.descripcion_rutina ? `<div class="routine-desc">${r.descripcion_rutina}</div>` : ""}
          <div class="routine-meta-row">
            <span class="routine-chip ${style.chip}">${r.nombre_tiporutina || "General"}</span>
            <span class="routine-freq">${r.frecuencia_rutina || "—"}${r.activa ? " · Activa" : " · Inactiva"}</span>
          </div>
        </div>
        <span class="routine-status ${statusClass}">${statusText}</span>
        <div class="routine-actions">
          <button class="btn-start" onclick="event.stopPropagation(); startRoutine(${r.id_rutina})">
            <span data-lucide="${isDone ? "repeat" : "play"}"></span> ${isDone ? "Repetir" : "Iniciar"}
          </button>
        </div>
      </div>`;
    })
    .join("");

  if (window.lucide) lucide.createIcons();
}

function switchSection(sectionId, element) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((i) => i.classList.remove("active"));

  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active");
  if (element) element.classList.add("active");

  const titleText = document.getElementById("topbar-title-text");
  const handIcon = document.querySelector(".topbar-title .title-icon");

  const titles = {
    dashboard: null,
    routines: "Mis Rutinas",
    progress: "Tu Progreso",
    settings: "Configuración",
    profile: "Mi Perfil",
  };

  if (sectionId === "dashboard") {
    if (handIcon) handIcon.style.display = "";
  } else {
    if (titleText) titleText.textContent = titles[sectionId] || "Rutins";
    if (handIcon) handIcon.style.display = "none";
  }

  if (window.lucide) lucide.createIcons();
}

function startRoutine(id) {
  sessionStorage.setItem("activeRoutineId", id);
  window.location.href = `ejecucion.html?id=${id}`;
}

function createRoutineModal() {
  window.location.href = "rutinas.html";
}

function editRoutine(id) {
  sessionStorage.setItem("editRoutineId", id);
  window.location.href = "rutinas.html";
}

function deleteRoutine(id) {
  sessionStorage.setItem("deleteRoutineId", id);
  window.location.href = "rutinas.html";
}

function goToSettings() {
  window.location.href = "configuracion.html";
}
