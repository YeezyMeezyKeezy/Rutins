const { supabase } = require("../database/supabase");

async function obtener(id) {
  const { data, error } = await supabase
    .from("perfil")
    .select("*")
    .eq("id_usuario", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function actualizar(id, datos) {
  const patch = {};
  if (datos.nombre_usuario !== undefined) patch.nombre_usuario = datos.nombre_usuario;
  if (datos.email_usuario !== undefined) patch.email_usuario = datos.email_usuario;

  if (datos.clave_usuario) {
    const { error } = await supabase.auth.updateUser({
      password: datos.clave_usuario,
    });
    if (error) throw new Error(error.message);
  }

  if (!Object.keys(patch).length) return 1;

  const { error } = await supabase.from("perfil").update(patch).eq("id_usuario", id);
  if (error) throw new Error(error.message);
  return 1;
}

async function eliminar() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    return { success: false, error: "No hay sesión para borrar la cuenta" };
  }

  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {},
  });

  if (error) {
    return { success: false, error: error.message || "No se pudo borrar la cuenta" };
  }
  if (!data?.success) {
    return { success: false, error: data?.error || "No se pudo borrar la cuenta" };
  }

  await supabase.auth.signOut().catch(() => {});
  return { success: true };
}

module.exports = { obtener, actualizar, eliminar };