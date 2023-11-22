import { seccion } from "../models/seccionModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import { matricula } from "../models/matriculaModel.js";
import { historial } from "../models/historialModel.js";
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

    res.status(200).json({ clases: clasesForMatricula });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener las clases para matricula" });
  }
};

export const subirNota = async (req, res) => {
  try {
    const { idSeccion, arrayEstudiantesNota } = req.body;

    console.log(idSeccion, arrayEstudiantesNota)
    for (const estudianteNota of arrayEstudiantesNota) {
      const { numeroCuenta, nota, estado } = estudianteNota;

      const findMatricula = await matricula.findOne({
        where: {  numeroCuenta: numeroCuenta ,idSeccion: idSeccion},
      });
      const { periodo } = findMatricula.dataValues;

      const findSeccion = await seccion.findOne({
        where: {idSeccion:findMatricula.idSeccion}
      });      

      const historialSubir = {
        numeroCuenta: numeroCuenta,
        idAsignatura: findSeccion.dataValues.idAsignatura,
        calificacion: nota,
        estado: estado,
        periodo: periodo,
      };

      const updateHistorial = await historial.create(historialSubir);

      console.log(softDeleteMatricula);
      console.log(updateHistorial);
    }

    res.status(200).json({ mensaje: "Notas subidas correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al subir nota" });
  }
};
