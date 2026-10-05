const { supabase } = require("../database/supabase");

class Ejecucion {
  async crear(datos) {
    const { data: auth } = await supabase.auth.getUser();
    const idUsuario = datos.id_usuario || auth.user?.id;
    if (!idUsuario) throw new Error("No hay sesión en Supabase");

    const { data, error } = await supabase
      .from("ejecucion")
      .insert({
        id_rutina: datos.id_rutina,
        id_usuario: idUsuario,
        fecha_ejecucion: datos.fecha_ejecucion || new Date().toISOString(),
        completada_ejecucion:
          datos.completada_ejecucion === 1 ||
          datos.completada_ejecucion === true,
        tiempo_total: datos.tiempo_total ?? 0,
      })
      .select("id_ejecucion")
      .single();

    if (error) throw new Error(error.message);
    return data.id_ejecucion;
  }

  async obtenerPorFecha(idUsuario, fecha) {
    const inicio = `${fecha}T00:00:00`;
    const fin = `${fecha}T23:59:59`;

    const { data, error } = await supabase
      .from("ejecucion")
      .select("*, rutina(nombre_rutina)")
      .eq("id_usuario", idUsuario)
      .gte("fecha_ejecucion", inicio)
      .lte("fecha_ejecucion", fin);

    if (error) throw new Error(error.message);
    return (data || []).map((e) => ({
      ...e,
      nombre_rutina: e.rutina?.nombre_rutina || "",
      completada_ejecucion: e.completada_ejecucion ? 1 : 0,
    }));
  }

  async obtenerPorRutina(idRutina) {
    const { data, error } = await supabase
      .from("ejecucion")
      .select("*")
      .eq("id_rutina", idRutina)
      .order("fecha_ejecucion", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((e) => ({
      ...e,
      completada_ejecucion: e.completada_ejecucion ? 1 : 0,
    }));
  }

  async obtenerUltimas(idUsuario, dias = 30) {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);

    const { data, error } = await supabase
      .from("ejecucion")
      .select("*, rutina(nombre_rutina, tiporutina(nombre_tiporutina))")
      .eq("id_usuario", idUsuario)
      .gte("fecha_ejecucion", desde.toISOString())
      .order("fecha_ejecucion", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((e) => ({
      ...e,
      nombre_rutina: e.rutina?.nombre_rutina || "",
      nombre_tiporutina: e.rutina?.tiporutina?.nombre_tiporutina || "",
      completada_ejecucion: e.completada_ejecucion ? 1 : 0,
    }));
  }

  async actualizar(id, datos) {
    const patch = {};
    if (datos.completada_ejecucion !== undefined) {
      patch.completada_ejecucion =
        datos.completada_ejecucion === 1 || datos.completada_ejecucion === true;
    }
    if (datos.tiempo_total !== undefined)
      patch.tiempo_total = datos.tiempo_total;
    if (datos.fecha_ejecucion !== undefined) {
      patch.fecha_ejecucion = datos.fecha_ejecucion;
    }

    const { error } = await supabase
      .from("ejecucion")
      .update(patch)
      .eq("id_ejecucion", id);

    if (error) throw new Error(error.message);
    return 1;
  }
}

module.exports = Ejecucion;
