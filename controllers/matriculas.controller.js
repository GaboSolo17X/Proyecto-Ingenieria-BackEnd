import { seccion } from "../models/seccionModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import { docente } from "../models/docenteModel.js";

export const obtenerClasesMatricula = async (req, res) => {
  try {
    const clasesMatricula = await seccion.findAll({
      include: [asignatura, docente],
    });
    const clasesForMatricula = [];

    for (const claseMatricula of clasesMatricula) {
      let horaInicial = claseMatricula.dataValues.horaInicial;
      let fecha = new Date(horaInicial);
      let hora = fecha.getUTCHours();
      let minuto = fecha.getUTCMinutes();
      let horaInicialFormato;
      if (minuto == 0) {
        horaInicialFormato = hora + "00";
      } else {
        horaInicialFormato = hora + ":" + minuto;
      }

      let clase = {
        nombreCarrera:
          claseMatricula.dataValues.asignatura.dataValues.nombreCarrera,
        cupos: claseMatricula.dataValues.cupos,
        nombreClase:
          claseMatricula.dataValues.asignatura.dataValues.nombreClase,
        uv: claseMatricula.dataValues.asignatura.dataValues.uv,
        dias: claseMatricula.dataValues.dias,
        horaInicial: horaInicialFormato,
        nombreCompleto:
          claseMatricula.dataValues.docente.dataValues.nombres +
          " " +
          claseMatricula.dataValues.docente.dataValues.apellidos,
      };

      clasesForMatricula.push(clase);
    }

    res.status(200).json({ clases: clasesForMatricula })

  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener las clases para matricula" });
  }
};
