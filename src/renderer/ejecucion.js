let routineId = null;
let userId = null;
let routine = null;
let activities = [];
let currentActivityIndex = 0;
let isRunning = true;
let isPaused = false;
let totalSeconds = 0;

// ============================================
// INICIALIZACIÓN
// ============================================

window.addEventListener("DOMContentLoaded", async () => {
  // TEMPORAL (diseño / pruebas)
  const user = {
    id_usuario: 1,
    nombre_usuario: "Juan Pérez",
    email_usuario: "juan@example.com",
  };

  // REAL (descomenta cuando actives auth):
  // const currentUser = localStorage.getItem('currentUser');
  // if (!currentUser) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  // const user = JSON.parse(currentUser);

  userId = user.id_usuario;

  routineId =
    new URLSearchParams(window.location.search).get("id") ||
    sessionStorage.getItem("activeRoutineId");

  if (!routineId) {
    alert("No se encontró la rutina");
    window.location.href = "dashboard.html";
    return;
  }

  await loadRoutine(routineId);
});

// ============================================
// CARGAR RUTINA
// ============================================

async function loadRoutine(id) {
  try {
    const routineResult = await window.api.rutina.obtener(id);

    if (!routineResult.success || !routineResult.data) {
      alert("No se encontró la rutina");
      window.location.href = "dashboard.html";
      return;
    }

    routine = routineResult.data;

    const activitiesResult = await window.api.actividad.obtenerPorRutina(id);
    activities =
      activitiesResult.success && activitiesResult.data
        ? activitiesResult.data.sort(
            (a, b) => a.orden_actividad - b.orden_actividad,
          )
        : [];

    initializeUI();
  } catch (error) {
    console.error("Error cargando rutina:", error);
    alert("Error al cargar la rutina");
    window.location.href = "dashboard.html";
  }
}

function initializeUI() {
  document.getElementById("routine-name").textContent = routine.nombre_rutina;
  document.getElementById("routine-type").textContent =
    routine.nombre_tiporutina || "Sin categoría";

  displayActivitiesList();

  if (!activities.length) {
    document.getElementById("activity-name").textContent = "Sin actividades";
    document.getElementById("activity-duration").textContent =
      "Añade actividades a esta rutina";
    document.getElementById("activity-status").textContent = "—";
    document.getElementById("activity-number").textContent = "0";
    document.getElementById("controls").style.display = "none";
    document.getElementById("progress-text").textContent = "0 de 0";
    return;
  }

  displayCurrentActivity();
}

// LISTA DE ACTIVIDADES

function formatDuration(totalSec) {
  const sec = parseInt(totalSec, 10) || 0;
  if (sec <= 0) return "Sin duración";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} s`;
}

function displayActivitiesList() {
  const container = document.getElementById("activities-container");

  if (!activities.length) {
    container.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">Sin actividades</div>';
    return;
  }

  container.innerHTML = activities
    .map((activity, index) => {
      let statusClass = "pending";
      let statusIcon = index + 1;

      if (index < currentActivityIndex) {
        statusClass = "completed";
        statusIcon = "✓";
      } else if (index === currentActivityIndex) {
        statusClass = "current";
        statusIcon = "→";
      }

      return `
      <div class="activity-item ${statusClass}">
        <div class="activity-item-status ${statusClass}">${statusIcon}</div>
        <div class="activity-item-info">
          <div class="activity-item-name">${activity.nombre_actividad}</div>
          <div class="activity-item-duration">${formatDuration(activity.duracion_actividad)}</div>
        </div>
      </div>`;
    })
    .join("");
}

function displayCurrentActivity() {
  if (currentActivityIndex >= activities.length) {
    finishRoutineUI();
    return;
  }

  const activity = activities[currentActivityIndex];
  document.getElementById("activity-number").textContent =
    currentActivityIndex + 1;
  document.getElementById("activity-name").textContent =
    activity.nombre_actividad;
  document.getElementById("activity-duration").textContent = formatDuration(
    activity.duracion_actividad,
  );
  document.getElementById("activity-status").textContent = "En progreso";
  document.getElementById("activity-status").className = "activity-status";

  updateProgressBar();
  displayActivitiesList();
  startActivityCountdown();
}

// ============================================
// TIMER
// ============================================

let countdownSeconds = 0;
let timerInterval = null;

function getActivityDurationSec(activity) {
  return Math.max(0, parseInt(activity?.duracion_actividad, 10) || 0);
}

function startActivityCountdown() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (currentActivityIndex >= activities.length) {
    finishRoutineUI();
    return;
  }

  const activity = activities[currentActivityIndex];
  countdownSeconds = getActivityDurationSec(activity);

  // Si no tiene duración, no cuenta atrás (el usuario usa "Siguiente")
  if (countdownSeconds <= 0) {
    updateTimerDisplay();
    return;
  }

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (!isRunning || isPaused) return;

    countdownSeconds--;
    totalSeconds++; // tiempo total de la sesión (para el resumen)
    updateTimerDisplay();

    if (countdownSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      // Pasa automáticamente a la siguiente
      currentActivityIndex++;
      displayCurrentActivity();
      startActivityCountdown();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const sec = Math.max(0, countdownSeconds);
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  document.getElementById("timer-display").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateProgressBar() {
  const total = activities.length || 1;
  const completed = currentActivityIndex;
  const percentage = (completed / total) * 100;
  document.getElementById("progress-fill").style.width = percentage + "%";
  document.getElementById("progress-text").textContent =
    `${completed} de ${total}`;
}

// ============================================
// CONTROLES
// ============================================

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("pause-btn");

  if (isPaused) {
    btn.textContent = "▶ Reanudar";
    btn.classList.add("btn-primary");
    btn.classList.remove("btn-secondary");
    document.getElementById("activity-status").textContent = "Pausada";
    document.getElementById("activity-status").className =
      "activity-status paused";
  } else {
    btn.textContent = "⏸ Pausar";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary");
    document.getElementById("activity-status").textContent = "En progreso";
    document.getElementById("activity-status").className = "activity-status";
  }
}

function skipActivity() {
  if (!activities.length) return;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentActivityIndex++;
  displayCurrentActivity();
}

function showConfirmQuit() {
  document.getElementById("confirm-modal").classList.add("active");
}

function closeConfirmQuit() {
  document.getElementById("confirm-modal").classList.remove("active");
}

function quitRoutine() {
  closeConfirmQuit();
  window.location.href = "dashboard.html";
}

// ============================================
// FINALIZAR
// ============================================

function finishRoutineUI() {
  isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const currentActivity = document.getElementById("current-activity");
  const controls = document.getElementById("controls");
  if (currentActivity) currentActivity.style.display = "none";
  if (controls) controls.style.display = "none";

  document.getElementById("summary-section").classList.add("show");
  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("progress-text").textContent =
    `${activities.length} de ${activities.length}`;

  const minutes = Math.floor(totalSeconds / 60);
  document.getElementById("total-time").textContent = minutes + " min";
  document.getElementById("activities-completed").textContent =
    activities.length;

  displayActivitiesList();
}

async function finishRoutine() {
  try {
    const result = await window.api.ejecucion.crear({
      id_rutina: parseInt(routineId, 10),
      id_usuario: userId,
      fecha_ejecucion: new Date().toISOString(),
      completada_ejecucion: 1,
      tiempo_total: Math.floor(totalSeconds / 60),
    });

    if (result.success) {
      await window.api.progreso.crearOActualizar(userId, {
        fecharegistro_progreso: new Date().toISOString().split("T")[0],
        rutinascompletadas_progreso: 1,
        porcentaje_progreso: 100,
        racha_progreso: 1,
      });

      window.location.href = "dashboard.html";
    } else {
      alert("Error al guardar: " + (result.error || "desconocido"));
    }
  } catch (error) {
    console.error("Error al guardar rutina:", error);
    alert("Error al guardar la rutina");
  }
}


