const { supabase } = require("../database/supabase");

class Cuenta {
  async exportar(idUsuario) {
    const { data: rutinas, error } = await supabase
      .from("rutina")
      .select("*, actividad(*)")
      .eq("id_usuario", idUsuario);

    if (error) throw new Error(error.message);

    return {
      app: "Rutins",
      tipo: "rutinas",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      rutinas: rutinas || [],
    };
  }

  async importar(payload) {
    const { data: auth } = await supabase.auth.getUser();
    const idUsuario = auth.user?.id;
    if (!idUsuario)
      return { success: false, error: "No hay sesión en Supabase" };

    if (
      !payload ||
      payload.app !== "Rutins" ||
      !Array.isArray(payload.rutinas)
    ) {
      return { success: false, error: "Archivo no válido de rutinas" };
    }

    for (const r of payload.rutinas) {
      const { data, error } = await supabase
        .from("rutina")
        .insert({
          id_usuario: idUsuario,
          nombre_rutina: r.nombre_rutina,
          descripcion_rutina: r.descripcion_rutina,
          id_tiporutina: r.id_tiporutina,
          frecuencia_rutina: r.frecuencia_rutina,
          activa: r.activa === 1 || r.activa === true,
        })
        .select("id_rutina")
        .single();

      if (error) return { success: false, error: error.message };

      const actividades = r.actividad || r.actividades || [];
      for (const a of actividades) {
        const { error: errorAct } = await supabase.from("actividad").insert({
          id_rutina: data.id_rutina,
          nombre_actividad: a.nombre_actividad,
          orden_actividad: a.orden_actividad,
          repeticiones_actividad: a.repeticiones_actividad,
          duracion_actividad: a.duracion_actividad,
          descanso_actividad: a.descanso_actividad,
        });
        if (errorAct) return { success: false, error: errorAct.message };
      }
    }

    return { success: true, id_usuario: idUsuario };
  }
}

module.exports = Cuenta;
