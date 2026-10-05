const { supabase } = require("../database/supabase");

class Auth {
  async registrar({ nombre_usuario, email_usuario, clave_usuario }) {
    const { data, error } = await supabase.auth.signUp({
      email: email_usuario,
      password: clave_usuario,
      options: {
        data: { nombre_usuario },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    if (!user) {
      return { success: false, error: "No se pudo crear la cuenta" };
    }

    if (!data.session) {
      return {
        success: false,
        error: "Cuenta creada, pero falta confirmar el email en Supabase",
      };
    }

    return {
      success: true,
      data: {
        id_usuario: user.id,
        nombre_usuario,
        email_usuario: user.email,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    };
  }

  async iniciar({ email_usuario, clave_usuario }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email_usuario,
      password: clave_usuario,
    });

    if (error) {
      return { success: false, error: "Email o contraseña incorrectos" };
    }

    const user = data.user;
    const nombre =
      user.user_metadata?.nombre_usuario || user.email.split("@")[0];

    return {
      success: true,
      data: {
        id_usuario: user.id,
        nombre_usuario: nombre,
        email_usuario: user.email,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    };
  }

  async cerrar() {
    await supabase.auth.signOut();
    return { success: true };
  }

  async recuperar({ email_usuario }) {
    const { error } = await supabase.auth.resetPasswordForEmail(email_usuario);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async restaurar(access_token, refresh_token) {
    if (!access_token || !refresh_token) {
      return { success: false, error: "Sin sesión de Supabase" };
    }
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data.user };
  }

  async actualizarNombre(nombre_usuario) {
    const { data: auth, error: errorUser } = await supabase.auth.getUser();
    if (errorUser || !auth.user) {
      return { success: false, error: "No hay sesión en Supabase" };
    }

    const { error: errorPerfil } = await supabase
      .from("perfil")
      .update({ nombre_usuario })
      .eq("id_usuario", auth.user.id);
    if (errorPerfil) return { success: false, error: errorPerfil.message };

    await supabase.auth.updateUser({ data: { nombre_usuario } });
    return { success: true };
  }

  async cambiarClave(clave_usuario) {
    const { error } = await supabase.auth.updateUser({
      password: clave_usuario,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}

module.exports = Auth;
