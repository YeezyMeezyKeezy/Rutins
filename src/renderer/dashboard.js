// ============================================
// TEMPORAL: desactivar login para ver el diseño
// Cuando quieras activarlo, descomenta el bloque real
// ============================================

window.addEventListener("DOMContentLoaded", async () => {
  // --- TEMPORAL (diseño) ---
  const user = {
    id_usuario: 1,
    nombre_usuario: "Juan Pérez",
    email_usuario: "juan@example.com",
  };

  // --- REAL (cuando actives login de nuevo) ---
  // const currentUser = localStorage.getItem('currentUser');
  // if (!currentUser) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  // const user = JSON.parse(currentUser);

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

  // No pisar el icono hand del topbar
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

async function loadDashboardData(user) {
  try {
    const rutinasResult = await window.api.rutina.obtenerTodas(user.id_usuario);

    // Ejecuciones de hoy
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let executionsToday = [];
    try {
      const execResult = await window.api.ejecucion.obtenerPorFecha(
        user.id_usuario,
        today,
      );
      if (execResult.success && execResult.data) {
        executionsToday = execResult.data;
      }
    } catch (e) {
      console.warn("No se pudieron cargar ejecuciones de hoy:", e);
    }

    if (rutinasResult.success && rutinasResult.data) {
      const routines = rutinasResult.data;
      const statTotal = document.getElementById("stat-total");
      if (statTotal) statTotal.textContent = routines.length;

      const badge = document.getElementById("routines-badge");
      if (badge && routines.length > 0) {
        badge.textContent = routines.length;
        badge.style.display = "inline";
      }

      const active = routines.filter((r) => r.activa === 1 || r.activa === true);
      const completedIds = new Set(
        (executionsToday || [])
          .filter((e) => e.completada_ejecucion === 1)
          .map((e) => e.id_rutina),
      );

      const pending = active.filter((r) => !completedIds.has(r.id_rutina)).length;
      const done = Math.max(0, active.length - pending);

      const statToday = document.getElementById("stat-today");
      if (statToday) statToday.textContent = pending;

     const todaySubtitle = document.getElementById("today-subtitle");
      if (todaySubtitle) {
        if (active.length === 0) {
          todaySubtitle.textContent = "No tienes rutinas activas para hoy.";
        } else if (pending === 0) {
          todaySubtitle.textContent =
            "Ya completaste todas las rutinas de hoy. ¡Buen trabajo!";
        } else if (done === 0) {
          todaySubtitle.textContent = `Tienes ${pending} rutina${pending > 1 ? "s" : ""} programada${pending > 1 ? "s" : ""}. ¡Mantén el foco!`;
        } else {
          todaySubtitle.textContent = `Has completado ${done}. Te ${pending === 1 ? "falta" : "faltan"} ${pending} rutina${pending > 1 ? "s" : ""}.`;
        }
      }

      // Solo el listado del home (ya no usamos la sección interna)
      renderRoutineRows("dashboard-routines", routines, executionsToday);
    }

    const progresoResult = await window.api.progreso.obtener(user.id_usuario);
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

function renderRoutineRows(containerId, routines, executionsToday = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const completedIds = new Set(
    (executionsToday || [])
      .filter((e) => e.completada_ejecucion === 1)
      .map((e) => e.id_rutina),
  );

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
      const isDone = completedIds.has(r.id_rutina);
      const statusClass = isDone ? "done" : "pending";
      const statusText = isDone ? "Completada" : "Pendiente";

      return `
      <div class="routine-row ${style.row}">
        <div class="routine-type-icon ${style.row || "red"}">
          <span data-lucide="${style.icon}"></span>
        </div>
        <div class="routine-info">
          <div class="routine-name">${r.nombre_rutina}</div>
          <div class="routine-meta-row">
            <span class="routine-chip ${style.chip}">${r.nombre_tiporutina || "General"}</span>
            <span class="routine-freq">${r.frecuencia_rutina || "—"}${r.activa ? " · Activa" : " · Inactiva"}</span>
          </div>
        </div>
        <span class="routine-status ${statusClass}">${statusText}</span>
        <div class="routine-actions">
          <button class="btn-start" onclick="event.stopPropagation(); startRoutine(${r.id_rutina})">
            <span data-lucide="play"></span> Iniciar
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
    dashboard: null, //mantiene el saludo
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

function logout() {
  if (confirm("¿Seguro que deseas cerrar sesión?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
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
