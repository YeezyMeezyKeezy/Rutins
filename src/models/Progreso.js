const { supabase } = require("../database/supabase");

class Progreso {
  async obtener(idUsuario) {
    const { data, error } = await supabase
      .from("progreso")
      .select("*")
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async crearOActualizar(idUsuario, datos) {
    const actual = await this.obtener(idUsuario);
    const completadas =
      (actual?.rutinascompletadas_progreso || 0) +
      (datos.rutinascompletadas_progreso || 0);
    const racha = Math.max(actual?.racha_progreso || 0, datos.racha_progreso || 0);

    const fila = {
      id_usuario: idUsuario,
      fecharegistro_progreso:
        datos.fecharegistro_progreso || new Date().toISOString().slice(0, 10),
      rutinascompletadas_progreso: completadas,
      porcentaje_progreso: datos.porcentaje_progreso ?? actual?.porcentaje_progreso ?? 0,
      racha_progreso: racha,
    };

    const { data, error } = await supabase
      .from("progreso")
      .upsert(fila, { onConflict: "id_usuario" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async actualizar(idUsuario, datos) {
    const { error } = await supabase
      .from("progreso")
      .update({
        fecharegistro_progreso: datos.fecharegistro_progreso,
        rutinascompletadas_progreso: datos.rutinascompletadas_progreso,
        porcentaje_progreso: datos.porcentaje_progreso,
        racha_progreso: datos.racha_progreso,
      })
      .eq("id_usuario", idUsuario);

    if (error) throw new Error(error.message);
    return 1;
  }
}

module.exports = Progreso;