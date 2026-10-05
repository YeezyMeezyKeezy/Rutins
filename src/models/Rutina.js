const { supabase } = require("../database/supabase");

class Rutina {
  async crear(datos) {
    const { data: auth } = await supabase.auth.getUser();
    const idUsuario = auth.user?.id;
    if (!idUsuario) throw new Error("No hay sesión en Supabase");

    const { data, error } = await supabase
      .from("rutina")
      .insert({
        id_usuario: idUsuario,
        nombre_rutina: datos.nombre_rutina,
        descripcion_rutina: datos.descripcion_rutina || null,
        id_tiporutina: datos.id_tiporutina,
        frecuencia_rutina: datos.frecuencia_rutina,
        activa: datos.activa === 1 || datos.activa === true,
      })
      .select("id_rutina")
      .single();

    if (error) throw new Error(error.message);
    return data.id_rutina;
  }

  async obtenerTodas(idUsuario) {
    const { data, error } = await supabase
      .from("rutina")
      .select("*, tiporutina(nombre_tiporutina)")
      .eq("id_usuario", idUsuario)
      .order("fechacreacion_rutina", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((r) => ({
      ...r,
      nombre_tiporutina: r.tiporutina?.nombre_tiporutina || "",
      activa: r.activa ? 1 : 0,
    }));
  }

  async obtener(id) {
    const { data, error } = await supabase
      .from("rutina")
      .select("*, tiporutina(nombre_tiporutina)")
      .eq("id_rutina", id)
      .single();

    if (error) throw new Error(error.message);
    return {
      ...data,
      nombre_tiporutina: data.tiporutina?.nombre_tiporutina || "",
      activa: data.activa ? 1 : 0,
    };
  }

  async actualizar(id, datos) {
    const { error } = await supabase
      .from("rutina")
      .update({
        nombre_rutina: datos.nombre_rutina,
        descripcion_rutina: datos.descripcion_rutina,
        id_tiporutina: datos.id_tiporutina,
        frecuencia_rutina: datos.frecuencia_rutina,
        activa: datos.activa === 1 || datos.activa === true,
      })
      .eq("id_rutina", id);

    if (error) throw new Error(error.message);
    return 1;
  }

  async eliminar(id) {
    const { error } = await supabase.from("rutina").delete().eq("id_rutina", id);
    if (error) throw new Error(error.message);
    return 1;
  }

  async obtenerTipos() {
    const { data, error } = await supabase
      .from("tiporutina")
      .select("*")
      .order("id_tiporutina");
    if (error) throw new Error(error.message);
    return data || [];
  }
}

module.exports = Rutina;