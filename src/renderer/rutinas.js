let currentRoutineId = null;
let currentUserId = null;
let activities = [];

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

  await loadRoutines(user.id_usuario);

  // Llegada desde dashboard (editar / eliminar)
  const editId = sessionStorage.getItem("editRoutineId");
  if (editId) {
    sessionStorage.removeItem("editRoutineId");
    await editRoutine(parseInt(editId, 10));
  }

  const deleteId = sessionStorage.getItem("deleteRoutineId");
  if (deleteId) {
    sessionStorage.removeItem("deleteRoutineId");
    await deleteRoutine(parseInt(deleteId, 10));
  }

  if (window.lucide) lucide.createIcons();
});

// ============================================
// CARGAR Y MOSTRAR
// ============================================

async function loadRoutines(userId) {
  try {
    const result = await window.api.rutina.obtenerTodas(userId);

    if (result.success && result.data && result.data.length > 0) {
      displayRoutines(result.data);
      const badge = document.getElementById("routines-badge");
      if (badge) {
        badge.textContent = result.data.length;
        badge.style.display = "inline";
      }
    } else {
      displayRoutines([]);
    }
  } catch (error) {
    console.error("Error cargando rutinas:", error);
  }
}

function getTypeStyle(nombreTipo) {
  const t = (nombreTipo || "").toLowerCase();
  if (
    t.includes("ejercicio") ||
    t.includes("exercise") ||
    t.includes("workout")
  ) {
    return { icon: "dumbbell", chip: "", row: "", fill: "red" };
  }
  if (t.includes("hábito") || t.includes("habit") || t.includes("lectura")) {
    return { icon: "book-open", chip: "blue", row: "blue", fill: "blue" };
  }
  if (t.includes("estudio") || t.includes("study")) {
    return { icon: "library", chip: "green", row: "green", fill: "green" };
  }
  return { icon: "clipboard-list", chip: "", row: "", fill: "red" };
}

function displayRoutines(routines) {
  const container = document.getElementById("routines-list");
  if (!container) return;

  if (!routines || routines.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><span data-lucide="clipboard-list"></span></div>
        <div class="empty-title">Sin rutinas aún</div>
        <div class="empty-subtitle">Crea tu primera rutina para comenzar</div>
        <button class="btn-start" onclick="openCreateModal()">
          <span data-lucide="plus"></span> Crear Primera Rutina
        </button>
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = routines
    .map((r) => {
      const style = getTypeStyle(r.nombre_tiporutina);
      return `
      <div class="routine-row ${style.row}">
        <div class="routine-type-icon ${style.row || "red"}">
          <span data-lucide="${style.icon}"></span>
        </div>
        <div class="routine-info">
          <div class="routine-name">${r.nombre_rutina}</div>
          <div class="routine-meta-row">
            <span class="routine-chip ${style.chip}">${r.nombre_tiporutina || "General"}</span>
            <span class="routine-freq">${r.frecuencia_rutina || "—"} · ${r.activa ? "Activa" : "Inactiva"}</span>
          </div>
        </div>
        <div class="routine-actions">
          <div class="btn-icon" onclick="editRoutine(${r.id_rutina})" title="Editar">
            <span data-lucide="pencil"></span>
          </div>
          <div class="btn-icon" onclick="deleteRoutine(${r.id_rutina})" title="Eliminar">
            <span data-lucide="trash-2"></span>
          </div>
          <button class="btn-start" onclick="startRoutine(${r.id_rutina})">
            <span data-lucide="play"></span> Iniciar
          </button>
        </div>
      </div>`;
    })
    .join("");

  if (window.lucide) lucide.createIcons();
}

function startRoutine(id) {
  sessionStorage.setItem("activeRoutineId", id);
  window.location.href = `ejecucion.html?id=${id}`;
}

// ============================================
// MODAL
// ============================================

function openCreateModal() {
  currentRoutineId = null;
  activities = [];
  document.getElementById("modal-title").textContent = "Nueva Rutina";
  document.getElementById("routine-name").value = "";
  document.getElementById("routine-description").value = "";
  document.getElementById("routine-type").value = "";
  document.getElementById("routine-frequency").value = "";
  document.getElementById("routine-active").checked = true;
  document.getElementById("activities-list").innerHTML = "";
  clearActivitiesError();
  document.getElementById("routine-modal").classList.add("active");
  addActivityField();
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById("routine-modal").classList.remove("active");
}

async function editRoutine(routineId) {
  const result = await window.api.rutina.obtener(routineId);

  if (result.success && result.data) {
    const routine = result.data;
    currentRoutineId = routineId;

    document.getElementById("modal-title").textContent = "Editar Rutina";
    document.getElementById("routine-name").value = routine.nombre_rutina;
    document.getElementById("routine-description").value =
      routine.descripcion_rutina || "";
    document.getElementById("routine-type").value = routine.id_tiporutina;
    document.getElementById("routine-frequency").value =
      routine.frecuencia_rutina;
    document.getElementById("routine-active").checked = routine.activa === 1;

    const activitiesResult =
      await window.api.actividad.obtenerPorRutina(routineId);
    if (activitiesResult.success && activitiesResult.data) {
      activities = activitiesResult.data;
      displayActivities();
    } else {
      activities = [];
      document.getElementById("activities-list").innerHTML = "";
    }

    clearActivitiesError();
    document.getElementById("routine-modal").classList.add("active");
    if (window.lucide) lucide.createIcons();
  }
}

async function deleteRoutine(routineId) {
  if (confirm("¿Estás seguro de que quieres eliminar esta rutina?")) {
    const result = await window.api.rutina.eliminar(routineId);
    if (result.success) {
      loadRoutines(currentUserId);
    }
  }
}

// ============================================
// ACTIVIDADES
// ============================================

function addActivityField() {
  clearActivitiesError();
  const container = document.getElementById("activities-list");
  const index = activities.length;

  const activityDiv = document.createElement("div");
  activityDiv.className = "activity-item";
  activityDiv.id = `activity-${index}`;
  activityDiv.innerHTML = `
    <div class="activity-fields">
      <input type="text" placeholder="Nombre de actividad" class="activity-name-input">
      <div class="duration-group">
        <input type="number" placeholder="0" class="activity-min-input" min="0" value="0">
        <span class="duration-unit">m</span>
      </div>
      <div class="duration-group">
        <input type="number" placeholder="0" class="activity-sec-input" min="0" max="59" value="0">
        <span class="duration-unit">s</span>
      </div>
    </div>
    <button type="button" class="activity-delete" onclick="removeActivity(${index})">
      <span data-lucide="trash-2"></span>
    </button>
  `;

  container.appendChild(activityDiv);
  activities.push({ index, name: "", duration: 0 });

  const nameInput = activityDiv.querySelector(".activity-name-input");
  if (nameInput) nameInput.addEventListener("input", clearActivitiesError);

  if (window.lucide) lucide.createIcons();
}

function removeActivity(index) {
  const el = document.getElementById(`activity-${index}`);
  if (el) el.remove();
  activities = activities.filter((_, i) => i !== index);
}

function displayActivities() {
  const container = document.getElementById("activities-list");
  container.innerHTML = activities
    .map((activity, index) => {
      const totalSec = parseInt(activity.duracion_actividad, 10) || 0;
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;

      return `
    <div class="activity-item" id="activity-${index}">
      <div class="activity-fields">
        <input type="text" placeholder="Nombre de actividad" class="activity-name-input"
          value="${activity.nombre_actividad || ""}">
        <div class="duration-group">
          <input type="number" placeholder="0" class="activity-min-input" min="0" value="${mins}">
          <span class="duration-unit">m</span>
        </div>
        <div class="duration-group">
          <input type="number" placeholder="0" class="activity-sec-input" min="0" max="59" value="${secs}">
          <span class="duration-unit">s</span>
        </div>
      </div>
      <button type="button" class="activity-delete" onclick="removeActivity(${index})">
        <span data-lucide="trash-2"></span>
      </button>
    </div>
  `;
    })
    .join("");

  container.querySelectorAll(".activity-name-input").forEach((input) => {
    input.addEventListener("input", clearActivitiesError);
  });

  if (window.lucide) lucide.createIcons();
}

function clearActivitiesError() {
  const list = document.getElementById("activities-list");
  const err = document.getElementById("activities-error");
  if (list) list.classList.remove("has-error");
  if (err) err.hidden = true;
}

function showActivitiesError() {
  const list = document.getElementById("activities-list");
  const err = document.getElementById("activities-error");
  if (list) list.classList.add("has-error");
  if (err) err.hidden = false;
  const first = list?.querySelector(".activity-name-input");
  if (first) first.focus();
  else {
    addActivityField();
    list?.querySelector(".activity-name-input")?.focus();
  }
}

// ============================================
// GUARDAR
// ============================================

async function saveRoutine(event) {
  event.preventDefault();
  clearActivitiesError();

  const activityItems = document.querySelectorAll(".activity-item");
  let actividadesValidas = 0;

  activityItems.forEach((item) => {
    const nameInput = item.querySelector(".activity-name-input");
    if (nameInput && nameInput.value.trim()) {
      actividadesValidas++;
    }
  });

  if (actividadesValidas === 0) {
    showActivitiesError();
    return;
  }

  const routineData = {
    nombre_rutina: document.getElementById("routine-name").value,
    descripcion_rutina: document.getElementById("routine-description").value,
    id_tiporutina: parseInt(document.getElementById("routine-type").value, 10),
    frecuencia_rutina: document.getElementById("routine-frequency").value,
    activa: document.getElementById("routine-active").checked ? 1 : 0,
    id_usuario: currentUserId,
  };

  try {
    let result;

    if (currentRoutineId) {
      result = await window.api.rutina.actualizar(
        currentRoutineId,
        routineData,
      );
    } else {
      result = await window.api.rutina.crear(routineData);
    }

    if (result.success) {
      const routineId = currentRoutineId || result.id;

      const activityInputs = document.querySelectorAll(".activity-item");
      for (let i = 0; i < activityInputs.length; i++) {
        const nameInput = activityInputs[i].querySelector(
          ".activity-name-input",
        );
        const minInput = activityInputs[i].querySelector(".activity-min-input");
        const secInput = activityInputs[i].querySelector(".activity-sec-input");

        if (nameInput && nameInput.value.trim()) {
          const mins = parseInt(minInput?.value, 10) || 0;
          const secs = parseInt(secInput?.value, 10) || 0;
          const totalSeconds = mins * 60 + secs;
          const activityData = {
            id_rutina: routineId,
            nombre_actividad: nameInput.value.trim(),
            orden_actividad: i + 1,
            duracion_actividad: totalSeconds,
          };

          if (activities[i] && activities[i].id_actividad) {
            await window.api.actividad.actualizar(
              activities[i].id_actividad,
              activityData,
            );
          } else {
            await window.api.actividad.crear(activityData);
          }
        }
      }

      closeModal();
      loadRoutines(currentUserId);
    } else {
      alert("Error al guardar la rutina: " + (result.error || ""));
    }
  } catch (error) {
    console.error("Error guardando rutina:", error);
    alert("Error al guardar la rutina");
  }
}

function goToSettings() {
  window.location.href = "configuracion.html";
}
