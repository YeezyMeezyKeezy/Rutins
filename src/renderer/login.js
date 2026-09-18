// ============================================
// UTILIDADES
// ============================================

function switchTab(tab) {
  document.getElementById("login-form").classList.remove("active");
  document.getElementById("register-form").classList.remove("active");
  const forgot = document.getElementById("forgot-form");
  if (forgot) forgot.classList.remove("active");

  document.querySelectorAll(".form-tab").forEach((t) => {
    t.classList.remove("active");
  });

  if (tab === "login") {
    document.getElementById("login-form").classList.add("active");
    document.querySelectorAll(".form-tab")[0]?.classList.add("active");
  } else if (tab === "register") {
    document.getElementById("register-form").classList.add("active");
    document.querySelectorAll(".form-tab")[1]?.classList.add("active");
  } else if (tab === "forgot" && forgot) {
    forgot.classList.add("active");
  }

  clearMessages();
}

function showMessage(formType, message, type) {
  const messageEl = document.getElementById(`${formType}-message`);
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
}

function clearMessages() {
  ["login", "register", "forgot"].forEach((id) => {
    const el = document.getElementById(`${id}-message`);
    if (el) el.className = "message";
  });
}

function showLoading(formType, show) {
  const loadingEl = document.getElementById(`${formType}-loading`);
  const btnEl = document.getElementById(`${formType}-btn`);
  if (loadingEl) loadingEl.classList.toggle("active", show);
  if (btnEl) btnEl.disabled = show;
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  btn.innerHTML = show
    ? '<span data-lucide="eye-off"></span>'
    : '<span data-lucide="eye"></span>';
  if (window.lucide) lucide.createIcons();
}

function saveSession(user, remember) {
  const payload = JSON.stringify({
    id_usuario: user.id_usuario,
    nombre_usuario: user.nombre_usuario,
    email_usuario: user.email_usuario,
  });
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("currentUser");
  if (remember) localStorage.setItem("currentUser", payload);
  else sessionStorage.setItem("currentUser", payload);
}

function getSession() {
  return (
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
}

function clearPasswordField() {
  const el = document.getElementById("login-password");
  if (!el) return;
  el.value = "";
  el.focus();
}

function openForgot(event) {
  if (event) event.preventDefault();
  switchTab("forgot");
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
      clearPasswordField();
      showLoading("login", false);
      return;
    }

    if (result.data.clave_usuario !== password) {
      showMessage("login", "Email o contraseña incorrectos", "error");
      clearPasswordField();
      showLoading("login", false);
      return;
    }

    const remember = document.getElementById("remember-me")?.checked;
    saveSession(result.data, remember);
    showMessage("login", "Iniciando sesión...", "success");

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

    const created = await window.api.usuario.obtenerPorEmail(email);
    if (!created.success || !created.data) {
      showMessage(
        "register",
        "Cuenta creada. Inicia sesión manualmente.",
        "success",
      );
      showLoading("register", false);
      switchTab("login");
      return;
    }

    const remember = document.getElementById("remember-me")?.checked ?? true;
    saveSession(created.data, remember);

    showMessage(
      "register",
      "Cuenta creada exitosamente. Iniciando sesión...",
      "success",
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
// RECUPERAR CONTRASEÑA (local)
// ============================================

async function handleForgot(event) {
  event.preventDefault();
  const email = document.getElementById("forgot-email").value.trim();
  const pass = document.getElementById("forgot-password").value;
  const confirm = document.getElementById("forgot-password-confirm").value;

  if (!email || !pass || !confirm) {
    showMessage("forgot", "Completa todos los campos", "error");
    return;
  }
  if (pass !== confirm) {
    showMessage("forgot", "Las contraseñas no coinciden", "error");
    return;
  }
  if (pass.length < 6) {
    showMessage("forgot", "Mínimo 6 caracteres", "error");
    return;
  }

  const found = await window.api.usuario.obtenerPorEmail(email);
  if (!found.success || !found.data) {
    showMessage("forgot", "No hay una cuenta con ese email", "error");
    return;
  }

  const upd = await window.api.usuario.actualizar(found.data.id_usuario, {
    clave_usuario: pass,
  });

  if (upd.success) {
    showMessage(
      "forgot",
      "Contraseña actualizada. Ya puedes entrar.",
      "success",
    );
    switchTab("login");
  } else {
    showMessage("forgot", "No se pudo actualizar", "error");
  }
}

// ============================================
// VERIFICAR SESIÓN EXISTENTE
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  if (getSession()) {
    window.location.href = "dashboard.html";
  }
});