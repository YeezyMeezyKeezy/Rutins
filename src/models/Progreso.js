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
    const hoy = fechaLocal();
    const ultima = String(actual?.fecharegistro_progreso || "").slice(0, 10);

    let racha = 1;
    if (ultima === hoy) {
      racha = actual?.racha_progreso || 1;
    } else if (ultima === diaAnterior(hoy)) {
      racha = (actual?.racha_progreso || 0) + 1;
    }

    const completadas =
      (actual?.rutinascompletadas_progreso || 0) +
      (datos.rutinascompletadas_progreso || 0);

    const fila = {
      id_usuario: idUsuario,
      fecharegistro_progreso: hoy,
      rutinascompletadas_progreso: completadas,
      porcentaje_progreso:
        datos.porcentaje_progreso ?? actual?.porcentaje_progreso ?? 0,
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

function fechaLocal(d = new Date()) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diaAnterior(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() - 1);
  return fechaLocal(fecha);
}

module.exports = Progreso;
