import { seccion } from "../models/seccionModel.js";
import { matricula } from "../models/matriculaModel.js";
import { docente } from "../models/docenteModel.js";
import { asignatura } from "../models/asignaturaModel.js";

export const actualizarVideo = async (req, res) => {
  let { idSeccion, linkVideo } = req.body;
  idSeccion = parseInt(idSeccion);
  const seccionActualizada = await seccion.update(
    { linkVideo },
    { where: { idSeccion } }
  );
  return res
    .status(200)
    .json({ message: "Seccion actualizada", seccionActualizada });
};

export const informacionDocente = async (req, res) => {
  let { numeroCuenta } = req.body;
  let docentesInfo = [];
  let matriculasEncontradas = await matricula.findAll({
    where: { numeroCuenta },
  });
  for (const matricula of matriculasEncontradas) {
    let { idSeccion } = matricula;
    let seccionEncontrada = await seccion.findOne({ where: { idSeccion } });
    let { numeroEmpleadoDocente, idAsignatura, horaInicial } =
      seccionEncontrada;
    let fecha = new Date(horaInicial);
    let hora = fecha.getUTCHours();
    let minuto = fecha.getUTCMinutes();
    let horaInicialFormato;
    if (minuto == 0) {
      horaInicialFormato = hora + "00";
    } else {
      horaInicialFormato = hora + ":" + minuto;
    }
    let asignaturaEncontrada = await asignatura.findOne({
      where: { idAsignatura },
    });
    let { nombreClase } = asignaturaEncontrada;
    let docenteEncontrado = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    let docenteInfo = {
      nombreCompleto:
        docenteEncontrado.nombres + " " + docenteEncontrado.apellidos,
      foto: docenteEncontrado.foto,
      linkVideo: seccionEncontrada.linkVideo,
      nombreSeccion: nombreClase,
      horainicial: horaInicialFormato,
    };
    docentesInfo.push(docenteInfo);
  }
  return res
    .status(200)
    .json({ message: "Informacion de docentes", docentesInfo });
};
