// ============================================
// UTILIDADES
// ============================================

function switchTab(tab) {
  document.getElementById("login-form").classList.remove("active");
  document.getElementById("register-form").classList.remove("active");

  document.querySelectorAll(".form-tab").forEach((t) => {
    t.classList.remove("active");
  });

  if (tab === "login") {
    document.getElementById("login-form").classList.add("active");
    document.querySelectorAll(".form-tab")[0].classList.add("active");
  } else {
    document.getElementById("register-form").classList.add("active");
    document.querySelectorAll(".form-tab")[1].classList.add("active");
  }

  clearMessages();
}

function showMessage(formType, message, type) {
  const messageEl = document.getElementById(`${formType}-message`);
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
}

function clearMessages() {
  document.getElementById("login-message").className = "message";
  document.getElementById("register-message").className = "message";
}

function showLoading(formType, show) {
  const loadingEl = document.getElementById(`${formType}-loading`);
  const btnEl = document.getElementById(`${formType}-btn`);

  if (show) {
    loadingEl.classList.add("active");
    btnEl.disabled = true;
  } else {
    loadingEl.classList.remove("active");
    btnEl.disabled = false;
  }
}

// ============================================
// LOGIN
// ============================================

async function handleLogin(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showMessage("login", "Por favor completa todos los campos", "error");
    return;
  }

  showLoading("login", true);

  try {
    const result = await window.api.usuario.obtenerPorEmail(email);

    if (!result.success || !result.data) {
      showMessage("login", "Email o contraseña incorrectos", "error");
      showLoading("login", false);
      return;
    }

    // Nota: En producción usar bcrypt
    if (result.data.clave_usuario !== password) {
      showMessage("login", "Email o contraseña incorrectos", "error");
      showLoading("login", false);
      return;
    }

    showMessage("login", "Iniciando sesión...", "success");

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id_usuario: result.data.id_usuario,
        nombre_usuario: result.data.nombre_usuario,
        email_usuario: result.data.email_usuario,
      }),
    );

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (error) {
    console.error("Error en login:", error);
    showMessage("login", "Error al iniciar sesión. Intenta de nuevo.", "error");
    showLoading("login", false);
  }
}

// ============================================
// REGISTRO
// ============================================

async function handleRegister(event) {
  event.preventDefault();
  clearMessages();

  const nombre = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const passwordConfirm = document.getElementById(
    "register-password-confirm",
  ).value;

  if (!nombre || !email || !password || !passwordConfirm) {
    showMessage("register", "Por favor completa todos los campos", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showMessage("register", "Las contraseñas no coinciden", "error");
    return;
  }

  if (password.length < 6) {
    showMessage(
      "register",
      "La contraseña debe tener al menos 6 caracteres",
      "error",
    );
    return;
  }

  showLoading("register", true);

  try {
    const existingUser = await window.api.usuario.obtenerPorEmail(email);

    if (existingUser.success && existingUser.data) {
      showMessage("register", "Este email ya está registrado", "error");
      showLoading("register", false);
      return;
    }

    const result = await window.api.usuario.crear({
      nombre_usuario: nombre,
      email_usuario: email,
      clave_usuario: password,
    });

    if (!result.success) {
      showMessage(
        "register",
        result.error || "Error al crear la cuenta",
        "error",
      );
      showLoading("register", false);
      return;
    }

    showMessage(
      "register",
      "Cuenta creada exitosamente. Iniciando sesión...",
      "success",
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id_usuario: result.id,
        nombre_usuario: nombre,
        email_usuario: email,
      }),
    );

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (error) {
    console.error("Error en registro:", error);
    showMessage(
      "register",
      "Error al crear la cuenta. Intenta de nuevo.",
      "error",
    );
    showLoading("register", false);
  }
}

// ============================================
// VERIFICAR SESIÓN EXISTENTE
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    window.location.href = "dashboard.html";
  }
});
