let currentUserId = null;

// ============================================
// INICIALIZACIÓN
// ============================================

window.addEventListener("DOMContentLoaded", async () => {
  // TEMPORAL
  const user = {
    id_usuario: 1,
    nombre_usuario: "Juan Pérez",
    email_usuario: "juan@example.com",
  };

  // REAL:
  // const currentUser = localStorage.getItem('currentUser');
  // if (!currentUser) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  // const user = JSON.parse(currentUser);

  currentUserId = user.id_usuario;

  const firstName = user.nombre_usuario.split(" ")[0];
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");
  if (userAvatar) userAvatar.textContent = firstName.charAt(0).toUpperCase();
  if (userName) {
    userName.textContent =
      firstName +
      (user.nombre_usuario.includes(" ")
        ? " " + user.nombre_usuario.split(" ")[1].charAt(0) + "."
        : "");
  }

  await updateRoutinesBadge(user.id_usuario);
  await loadProgressData(user.id_usuario);
  if (window.lucide) lucide.createIcons();
});


// ============================================
// CARGAR DATOS
// ============================================

async function updateRoutinesBadge(userId) {
  const badge = document.getElementById("routines-badge");
  if (!badge) return;

  try {
    const result = await window.api.rutina.obtenerTodas(userId);
    const count =
      result.success && result.data ? result.data.length : 0;

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline";
    } else {
      badge.textContent = "0";
      badge.style.display = "none";
    }
  } catch (e) {
    console.warn("No se pudo actualizar el badge de rutinas:", e);
  }
}

async function loadProgressData(userId) {
  try {
    const progressResult = await window.api.progreso.obtener(userId);
    if (progressResult.success && progressResult.data) {
      displayProgressCards(progressResult.data);
    }

    const executionsResult = await window.api.ejecucion.obtenerUltimas(
      userId,
      30,
    );
    if (executionsResult.success && executionsResult.data) {
      displayExecutions(executionsResult.data);
      displayWeekChart(executionsResult.data);
      displayBreakdown(executionsResult.data);
    }

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error("Error cargando progreso:", error);
  }
}

function displayProgressCards(progress) {
  const pct = Math.round(progress.porcentaje_progreso || 0);
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set("stat-completed", pct + "%");
  set("stat-consistency", pct + "%");
  set("stat-streak", progress.racha_progreso || 0);
  set("trend-completed", pct > 0 ? "↑" : "—");
}

// ============================================
// GRÁFICO ÚLTIMOS 7 DÍAS
// ============================================

function displayWeekChart(executions) {
  const chartContainer = document.getElementById("week-chart");
  if (!chartContainer) return;

  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    last7Days.push({
      date: dateStr,
      day: date.toLocaleDateString("es-ES", { weekday: "short" }),
      count: 0,
    });
  }

  executions.forEach((execution) => {
    const executionDate = (execution.fecha_ejecucion || "").split("T")[0];
    const dayData = last7Days.find((d) => d.date === executionDate);
    if (dayData && execution.completada_ejecucion) {
      dayData.count++;
    }
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  chartContainer.innerHTML = last7Days
    .map((day) => {
      const height = Math.max((day.count / maxCount) * 100, 4);
      const isActive = day.count === maxCount && day.count > 0;
      return `
      <div class="chart-bar-item">
        <div class="chart-bar-fill ${isActive ? "active" : ""}" style="height:${height}%;"></div>
        <div class="chart-bar-label">${day.day}</div>
      </div>
    `;
    })
    .join("");

  const total = last7Days.reduce((s, d) => s + d.count, 0);
  const note = document.getElementById("chart-note");
  if (note) {
    note.textContent =
      total > 0
        ? `Completaste ${total} rutina${total > 1 ? "s" : ""} en los últimos 7 días.`
        : "Aún no hay actividad esta semana.";
  }
}

// ============================================
// BREAKDOWN POR RUTINA
// ============================================

function displayBreakdown(executions) {
  const container = document.getElementById("breakdown-list");
  if (!container) return;

  if (!executions || executions.length === 0) {
    container.innerHTML = '<div class="empty-mini">Sin datos aún</div>';
    return;
  }

  const byRoutine = {};
  executions.forEach((e) => {
    const name = e.nombre_rutina || "Sin nombre";
    if (!byRoutine[name]) byRoutine[name] = { total: 0, done: 0 };
    byRoutine[name].total++;
    if (e.completada_ejecucion) byRoutine[name].done++;
  });

  const icons = ["dumbbell", "book-open", "library", "target", "star"];
  const colors = [
    "var(--ex)",
    "var(--hab)",
    "var(--est)",
    "var(--brand)",
    "#d68910",
  ];
  const bgs = [
    "var(--brand-pale)",
    "#e8f4fb",
    "#e9f7ee",
    "var(--brand-pale)",
    "#fef9e7",
  ];

  const entries = Object.entries(byRoutine).slice(0, 5);

  container.innerHTML = entries
    .map(([name, data], i) => {
      const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;
      return `
      <div class="prog-detail-item">
        <div class="prog-detail-icon" style="background:${bgs[i % bgs.length]};color:${colors[i % colors.length]};">
          <span data-lucide="${icons[i % icons.length]}"></span>
        </div>
        <div class="prog-detail-name">${name}</div>
        <div class="prog-detail-bar">
          <div class="prog-detail-fill" style="width:${pct}%;background:${colors[i % colors.length]};"></div>
        </div>
        <div class="prog-detail-pct" style="color:${colors[i % colors.length]};">${pct}%</div>
      </div>
    `;
    })
    .join("");

  if (window.lucide) lucide.createIcons();
}

// ============================================
// TABLA DE EJECUCIONES
// ============================================

function displayExecutions(executions) {
  const tbody = document.getElementById("executions-tbody");
  if (!tbody) return;

  if (!executions || executions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <div class="empty-icon"><span data-lucide="bar-chart-3"></span></div>
            <div class="empty-title">Sin historial aún</div>
            <div class="empty-subtitle">Completa rutinas para ver tu historial</div>
          </div>
        </td>
      </tr>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const sorted = executions
    .sort((a, b) => new Date(b.fecha_ejecucion) - new Date(a.fecha_ejecucion))
    .slice(0, 20);

  tbody.innerHTML = sorted
    .map((execution) => {
      const date = new Date(execution.fecha_ejecucion);
      const dateStr = date.toLocaleDateString("es-ES");
      const timeStr = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const status = execution.completada_ejecucion
        ? "Completada"
        : "Pendiente";
      const statusClass = execution.completada_ejecucion ? "" : "pending";
      const timeDisplay = execution.tiempo_total
        ? `${execution.tiempo_total} min`
        : "N/A";
      const statusIcon = execution.completada_ejecucion ? "check" : "clock";

      return `
      <tr>
        <td>${execution.nombre_rutina || "Sin nombre"}</td>
        <td>${dateStr} ${timeStr}</td>
        <td>${timeDisplay}</td>
        <td>
          <span class="status-badge ${statusClass}">
            <span data-lucide="${statusIcon}"></span>
            ${status}
          </span>
        </td>
      </tr>`;
    })
    .join("");

  if (window.lucide) lucide.createIcons();
}

function switchPeriod(period, el) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
}

function goToSettings() {
  window.location.href = "configuracion.html";
}

