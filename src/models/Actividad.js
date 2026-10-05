const { supabase } = require("../database/supabase");

class Actividad {
  async crear(datos) {
    const { data, error } = await supabase
      .from("actividad")
      .insert({
        id_rutina: datos.id_rutina,
        nombre_actividad: datos.nombre_actividad,
        orden_actividad: datos.orden_actividad,
        repeticiones_actividad: datos.repeticiones_actividad ?? null,
        duracion_actividad: datos.duracion_actividad ?? null,
        descanso_actividad: datos.descanso_actividad ?? 0,
      })
      .select("id_actividad")
      .single();

    if (error) throw new Error(error.message);
    return data.id_actividad;
  }

  async obtenerPorRutina(idRutina) {
    const { data, error } = await supabase
      .from("actividad")
      .select("*")
      .eq("id_rutina", idRutina)
      .order("orden_actividad");

    if (error) throw new Error(error.message);
    return data || [];
  }

  async actualizar(id, datos) {
    const { error } = await supabase
      .from("actividad")
      .update({
        id_rutina: datos.id_rutina,
        nombre_actividad: datos.nombre_actividad,
        orden_actividad: datos.orden_actividad,
        repeticiones_actividad: datos.repeticiones_actividad ?? null,
        duracion_actividad: datos.duracion_actividad ?? null,
        descanso_actividad: datos.descanso_actividad ?? 0,
      })
      .eq("id_actividad", id);

    if (error) throw new Error(error.message);
    return 1;
  }

  async eliminar(id) {
    const { error } = await supabase
      .from("actividad")
      .delete()
      .eq("id_actividad", id);

    if (error) throw new Error(error.message);
    return 1;
  }
}

module.exports = Actividad;
