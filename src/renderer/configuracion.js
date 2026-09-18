let currentUser = null;

window.addEventListener("DOMContentLoaded", async () => {
  // TEMPORAL (diseño / pruebas)
  currentUser = {
    id_usuario: 1,
    nombre_usuario: "Juan Pérez",
    email_usuario: "juan@example.com",
  };

  // REAL:
  // const userStr = localStorage.getItem('currentUser');
  // if (!userStr) {
  //   window.location.href = 'login.html';
  //   return;
  // }
  // currentUser = JSON.parse(userStr);

  initializeSettings();
  await updateRoutinesBadge(currentUser.id_usuario);
});

async function updateRoutinesBadge(userId) {
  const badge = document.getElementById("routines-badge");
  if (!badge) return;

  try {
    const result = await window.api.rutina.obtenerTodas(userId);
    const count = result.success && result.data ? result.data.length : 0;

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline";
    } else {
      badge.textContent = "0";
      badge.style.display = "none"; // o "inline" si quieres ver el 0
    }
  } catch (e) {
    console.warn("No se pudo actualizar el badge de rutinas:", e);
  }
}

function initializeSettings() {
  const first = currentUser.nombre_usuario.split(" ")[0];
  const letter = first.charAt(0).toUpperCase();

  document.getElementById("user-avatar").textContent = letter;
  document.getElementById("user-name").textContent =
    first +
    (currentUser.nombre_usuario.includes(" ")
      ? " " + currentUser.nombre_usuario.split(" ")[1].charAt(0) + "."
      : "");

  document.getElementById("profile-name").value = currentUser.nombre_usuario;
  document.getElementById("profile-email").value = currentUser.email_usuario;
}

function resetProfileForm() {
  document.getElementById("profile-name").value = currentUser.nombre_usuario;
}

async function saveProfile() {
  const newName = document.getElementById("profile-name").value.trim();

  if (!newName) {
    showMessage("profile-message", "El nombre no puede estar vacío", "error");
    return;
  }

  const result = await window.api.usuario.actualizar(currentUser.id_usuario, {
    nombre_usuario: newName,
  });

  if (result.success) {
    currentUser.nombre_usuario = newName;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showMessage("profile-message", "✓ Perfil actualizado", "success");
    initializeSettings();
  } else {
    showMessage("profile-message", "Error al actualizar el perfil", "error");
  }
}

function resetPasswordForm() {
  document.getElementById("current-password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";
}

async function changePassword() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage("security-message", "Completa todos los campos", "error");
    return;
  }
  if (newPassword !== confirmPassword) {
    showMessage("security-message", "Las contraseñas no coinciden", "error");
    return;
  }
  if (newPassword.length < 6) {
    showMessage("security-message", "Mínimo 6 caracteres", "error");
    return;
  }

  const result = await window.api.usuario.actualizar(currentUser.id_usuario, {
    clave_usuario: newPassword,
  });

  if (result.success) {
    showMessage("security-message", "✓ Contraseña cambiada", "success");
    resetPasswordForm();
  } else {
    showMessage("security-message", "Error al cambiar la contraseña", "error");
  }
}

async function exportAccount() {
  const result = await window.api.cuenta.exportar(currentUser.id_usuario);
  if (result.canceled) return;
  if (result.success) {
    showMessage("data-message", "Cuenta exportada correctamente.", "success");
  } else {
    showMessage("data-message", result.error || "No se pudo exportar", "error");
  }
}

async function importAccount() {
  if (
    !confirm(
      "Si el email del archivo ya existe en este PC, se borrarán sus rutinas y progreso actuales y se reemplazarán por los del archivo.\n\n¿Quieres importar la cuenta?",
    )
  ) {
    return;
  }

  const result = await window.api.cuenta.importar();
  if (result.canceled) return;

  if (result.success) {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id_usuario: result.id_usuario,
        nombre_usuario: result.nombre_usuario,
        email_usuario: result.email_usuario,
      }),
    );
    showMessage("data-message", "Cuenta importada correctamente.", "success");
    window.location.reload();
  } else {
    showMessage("data-message", result.error || "No se pudo importar", "error");
  }
}

async function deleteAccountConfirm() {
  const confirmed = confirm(
    "¿Eliminar tu cuenta?\n\nSe borrarán todas tus rutinas, actividades, ejecuciones y progreso.\nEsta acción es PERMANENTE.",
  );
  if (!confirmed) return;

  const lastConfirm = confirm(
    "Última confirmación.\n\n¿Estás seguro de que quieres eliminar la cuenta para siempre?",
  );
  if (!lastConfirm) return;

  try {
    const result = await window.api.usuario.eliminar(currentUser.id_usuario);

    if (result.success) {
      localStorage.removeItem("currentUser");
      sessionStorage.clear();
      alert("Cuenta eliminada correctamente.");
      window.location.href = "login.html";
    } else {
      alert("Error al eliminar la cuenta: " + (result.error || "desconocido"));
    }
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    alert("Error al eliminar la cuenta");
  }
}

function logout() {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

function showMessage(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
}
