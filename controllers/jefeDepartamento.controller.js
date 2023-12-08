import { jefeDepartamento } from "../models/jefeDepartamentoModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { docente } from "../models/docenteModel.js";
import { seccion } from "../models/seccionModel.js";
import { matricula } from "../models/matriculaModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { evaluacion } from "../models/evaluacionModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import { edificio } from "../models/edificioModel.js";
import { aula } from "../models/aulaModel.js";
import { JustificacionCancelacionSeccion } from "../models/justificacionCancelacionSeccionModel.js";
import { listaEspera } from "../models/listaEsperaModel.js";
import { indiceAcademico } from "../models/indiceAcademicoModel.js";
import mailer from "../config/confMailer.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

export const loginJefeDepartamento = async (req, res) => {
  try {
    const { id, clave } = req.body;
    let jefeDepartamentoLogin = await jefeDepartamento.findOne({
      where: { numeroEmpleadoDocente: id },
    });
    const hashedPassword = jefeDepartamentoLogin.claveJefe;
    if (!jefeDepartamentoLogin) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }
    const respuestaPassword = await comparePassword(clave, hashedPassword);
    if (!respuestaPassword) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }

    const docenteFind = await docente.findOne({
      where: { numeroEmpleadoDocente: id },
    }); //aqui estuvo Ericka

    const { token, expiresIn } = generateJWT(
      jefeDepartamentoLogin.numeroEmpleadoDocente
    );
    generateRefreshJWT(jefeDepartamentoLogin.numeroEmpleadoDocente, res);

    return res.status(200).json({
      message: "Login exitoso",
      token,
      expiresIn,
      jefe: jefeDepartamentoLogin,
      docente: docenteFind,
    }); //aqui estuvo Ericka
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const notasIngresadasDocentesDepartamento = async (req, res) => {
  try {
    const { nombreDocente, codigoAsignatura, idseccion } = req.body;
    const seccionFound = await seccion.findOne({
      where: { idSeccion: idseccion },
    });
    const { idSeccion } = seccionFound.dataValues;
    let registrosCalificacionesArray = [];
    const matriculasFound = await matricula.findAll({
      where: { idSeccion: idSeccion },
    });
    //numero de cuenta, nombre completo , nota, observacion
    for (const matricula of matriculasFound) {
      const { numeroCuenta, calificacion, estado } = matricula;
      const estudianteFound = await estudiante.findOne({
        where: { numeroCuenta: numeroCuenta },
      });
      const { nombres, apellidos } = estudianteFound;
      let registro = {
        numeroCuenta: numeroCuenta,
        nombreCompleto: nombres + " " + apellidos,
        nota: calificacion,
        observacion: estado,
      };
      registrosCalificacionesArray.push(registro);
    }
    return res.status(200).json({
      message: "calificaciones",
      calificaciones: registrosCalificacionesArray,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerEvaluacionesDocentesDepartamento = async (req, res) => {
  try {
    const { numeroEmpleadoDocente, idSeccion, idAsignatura } = req.body;
    const matriculaFound = await matricula.findAll({
      where: { idSeccion: idSeccion },
    });
    if (!matriculaFound) {
      return res.status(400).json({ message: "No hay matriculas" });
    }
    let evaluacionesFoundArray = [];
    for (const matricula of matriculaFound) {
      const { idMatricula } = matricula;
      const evaluacionesFound = await evaluacion.findOne({
        where: { idMatricula: idMatricula },
      });
      if (!evaluacionesFound) {
      } else {
        const { idEvalucion } = evaluacionesFound.dataValues;
        evaluacionesFoundArray.push(idEvalucion);
      }
    }
    if (evaluacionesFoundArray == []) {
      return res.status(400).json({ message: "No hay evaluaciones" });
    } else {
      return res.status(200).json({
        message: "Evaluaciones de docentes",
        evaluaciones: evaluacionesFoundArray,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerEvaluacion = async (req, res) => {
  try {
    const { idEvalucion } = req.body;
    const evaluacionFound = await evaluacion.findOne({
      where: { idEvalucion: idEvalucion },
    });
    if (!evaluacionFound) {
      return res.status(400).json({ message: "No hay evaluaciones" });
    }
    return res
      .status(200)
      .json({ message: "Evaluaciones de docentes", evaluacionFound });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
    console.log(error);
  }
};

export const ObtenerListadoEstudiantes = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const docentesFounds = await docente.findAll({
      where: { numeroEmpleadoDocente: numeroEmpleadoDocente },
    });
    if (!docentesFounds) {
      return res.status(400).json({ message: "No hay docentes" });
    }
    const { nombreCarrera } = docentesFounds;
    const matriculasFound = await matricula.findAll({
      where: { nombreCarrera: nombreCarrera },
    });
    if (!matriculasFound) {
      return res.status(400).json({ message: "No hay matriculas" });
    }
    for (const matricula of matriculasFound) {
      const { numeroCuenta } = matricula;
      const estudianteFound = await estudiante.findOne({
        where: { numeroCuenta: numeroCuenta },
      });
      const { nombres, apellidos } = estudianteFound;
      return res.status(200).json({
        message: "Listado de estudiantes",
        nombres,
        apellidos,
        numeroCuenta,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const restablecerContraseña = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const docentesFounds = await docente.findOne({
      where: { numeroEmpleadoDocente: numeroEmpleadoDocente },
    });
    if (!docentesFounds) {
      return res.status(400).json({ message: "No hay docentes" });
    }
    const { correo, nombres, apellidos } = docentesFounds.dataValues;
    let docenteInfo = { correo, nombres, apellidos };
    const token = jwt.sign({ numeroEmpleadoDocente }, process.env.JWT_SECRET, {
      expiresIn: "2m",
    });
    const resetLink = `http://localhost:3000/restablecerContrasenia?token=${token}`;
    const respuesta = await enviarCorreo(docenteInfo, resetLink);
    if (!respuesta) {
      return res.status(400).json({ message: "No se pudo enviar el correo" });
    }
    return res.status(200).json({ message: "Correo enviado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export async function enviarCorreo(docente, resetLink) {
  //funcion para elementos generico de envio de correo
  try {
    const mailOptions = {
      from:
        "Administradores" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
      to: `${docente.correo}`,
      subject: "Restablecer Clave",
      Text: `Para restablecer tu clave, haz clic en el siguiente enlace: ${resetLink}`,
      html: `
                <h1>Un gusto saludarte, <strong>${
                  docente.nombres + " " + docente.apellidos
                }<strong>.</h1>
                <h2>Para restablecer tu clave, haz clic en el siguiente enlace:</h2><br>
                <a href="${resetLink}">Restablecer Clave</a>   
                `,
    };
    const respuesta = await mailer.sendMail(mailOptions);
    return respuesta;
  } catch (error) {
    console.log(error);
  }
}

export const obtenerDocente = async (req, res) => {
  try {
    //Numero ,  NOMBRE, centro , clase(CODIGO
    const { numeroEmpleadoDocente } = req.body;
    const jefeCentro = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { centroRegional, nombreCarrera } = jefeCentro;
    const docenteFound = await docente.findAll({
      where: { centroRegional, nombreCarrera },
    });
    if (!docenteFound) {
      return res.status(400).json({ message: "No hay docentes" });
    }
    let arraySecciones = [];
    for (const docente of docenteFound) {
      const { numeroEmpleadoDocente, nombres, apellidos, correo } = docente;
      const horasOcupadasDocente = await seccion.findAll({
        where: { numeroEmpleadoDocente: numeroEmpleadoDocente },
      });

      for (const seccionFound of horasOcupadasDocente) {
        const { idAsignatura, idSeccion } = seccionFound;
        let { horaInicial } = seccionFound;
        const fecha = new Date(horaInicial);
        const horasUTC = fecha.getUTCHours().toString().padStart(2, "0");
        const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, "0");
        const horaFormateadaUTC = `${horasUTC}${minutosUTC}`;
        const asignaturaFound = await asignatura.findOne({
          where: { idAsignatura },
        });
        const { codigoAsignatura, nombreClase } = asignaturaFound;
        let seccionInsert = {
          numero: numeroEmpleadoDocente,
          nombre: nombres + " " + apellidos,
          codigo: codigoAsignatura,
          asignatura: nombreClase,
          seccion: horaFormateadaUTC,
          idseccion: idSeccion,
          idAsignatura: idAsignatura,
          correoDocente: correo,
        };
        arraySecciones.push(seccionInsert);
      }
    }
    return res
      .status(200)
      .json({ message: "Docente encontrado", secciones: arraySecciones });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const listadoEstudiantesMatriculado = async (req, res) => {
  try {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const { numeroEmpleadoDocente } = req.body;
    console.log(numeroEmpleadoDocente);
    const jefeDepartamentoFound = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { nombreCarrera } = jefeDepartamentoFound.dataValues;
    const matriculasFound = await matricula.findAll({
      where: { nombreCarrera },
    });
    let arrayMatriculas = [];
    let cuentasProcesadas = {};
    for (const matricula of matriculasFound) {
      const { numeroCuenta, idSeccion } = matricula;
      if (!cuentasProcesadas[numeroCuenta]) {
        const estudianteFound = await estudiante.findOne({
          where: { numeroCuenta },
        });
        const { nombres, apellidos, correoPersonal } = estudianteFound;
        let matriculaInsert = [
          numeroCuenta,
          `${nombres} ${apellidos}`,
          correoPersonal,
        ];
        arrayMatriculas.push(matriculaInsert);
        cuentasProcesadas[numeroCuenta] = true;
      }
    }

    let body = [
      ["Numero de Cuenta", "Nombre Completo", "Correo Personal"],
      ...arrayMatriculas,
    ];
    let columnWidths = ["auto", "auto", "auto"];

    let docDefinition = {
      content: [
        {
          table: {
            widths: columnWidths,
            body: body,
          },
        },
      ],
    };
    let pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => {
      res.end(new Buffer(buffer, "base64"));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerAsignaturasDepartamento = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const docentesFounds = await docente.findOne({
      where: { numeroEmpleadoDocente: numeroEmpleadoDocente },
    });
    if (!docentesFounds) {
      return res.status(400).json({ message: "No hay docentes" });
    }
    const { nombreCarrera, centroRegional } = docentesFounds.dataValues;
    console.log(nombreCarrera, centroRegional);
    const asignaturasFound = await asignatura.findAll({
      where: { nombreCarrera: nombreCarrera, centroRegional: centroRegional },
    });
    if (!asignaturasFound) {
      return res.status(400).json({ message: "No hay asignaturas" });
    }
    return res
      .status(200)
      .json({ message: "Listado de asignaturas", asignaturasFound });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerDocentesDepartamento = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const jefeCentro = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { nombreCarrera, centroRegional } = jefeCentro;
    const docenteFound = await docente.findAll({
      where: { nombreCarrera, centroRegional },
    });
    if (docenteFound.length == 0) {
      return res.status(400).json({ message: "No hay docentes" });
    }
    return res
      .status(200)
      .json({ message: "Docente encontrado", docenteFound });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerEdificios = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const jefeCentro = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { centroRegional } = jefeCentro;
    const edificiosFound = await edificio.findAll({
      where: { centroRegional },
    });
    if (edificiosFound.length == 0) {
      return res.status(400).json({ message: "No hay edificios" });
    }
    return res
      .status(200)
      .json({ message: "Edificios encontrados", edificiosFound });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerAulas = async (req, res) => {
  try {
    const { nombreEdificio } = req.body;
    const edificiosFound = await edificio.findOne({
      where: { nombreEdificio },
    });
    const { idEdificio } = edificiosFound.dataValues;
    const aulasFound = await aula.findAll({ where: { idEdificio } });
    if (aulasFound.length == 0) {
      return res.status(400).json({ message: "No hay aulas" });
    }
    return res.status(200).json({ message: "Aulas encontradas", aulasFound });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerHorasDisponibles = async (req, res) => {
  try {
    const { nombreEdificio, numeroAula, dias, uv } = req.body;
    let horas = [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
    ];

    // TRANSFORMAR DIAS A STRING
    let diasSemana = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
    let diasSeleccionadosNombres = diasSemana.filter(
      (dia, index) => dias[index]
    );
    let diasSeleccionados = diasSeleccionadosNombres.join("");
    let diasSemanaCompleto = diasSemana.join("");

    // TRANSFORMAR NOMBRE COMPLETO A NOMBRE Y APELLIDO
    let { nombreDocente } = req.body;
    let partes = nombreDocente.split(" ");
    let nombres = partes[0] + " " + partes[1];

    //NUMERO DE EMPLEADO DOCENTE
    const docenteFound = await docente.findOne({ where: { nombres } });
    const { numeroEmpleadoDocente } = docenteFound.dataValues;
    console.log(
      nombreEdificio,
      numeroAula,
      uv,
      diasSeleccionados,
      numeroEmpleadoDocente
    );

    //Obtener las secciones que ya se le asignaron al docente y eliminar respectivas horas de la lista
    const horasOcupadasDocente = await seccion.findAll({
      where: { numeroEmpleadoDocente },
    });
    if (horasOcupadasDocente.length == 0) {
    }
    for (const seccion of horasOcupadasDocente) {
      const { horaInicial, horaFinal, dias } = seccion;
      const fecha = new Date(horaInicial);
      const horasUTC = fecha.getUTCHours().toString().padStart(2, "0");
      const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, "0");
      const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

      horas = horas.filter((hora) => hora != horaFormateadaUTC);
    }

    if (typeof diasSeleccionados === "string") {
      diasSeleccionados = diasSeleccionados.match(/.{1,2}/g); // Divide la cadena en trozos de dos caracteres
    }

    const seccionesAula = await seccion.findAll({
      where: { edificio: nombreEdificio, aula: numeroAula },
    });
    if (seccionesAula.length == 0) {
      return res.status(200).json({ message: "Horas disponibles", horas });
    } else {
      for (const seccion of seccionesAula) {
        const { horaInicial, dias } = seccion;
        const diasSeccion = dias.match(/.{1,2}/g);
        // Comprobar si hay una superposición de días
        const superposicionDias = diasSeleccionados.some((dia) =>
          diasSeccion.includes(dia)
        );

        if (superposicionDias) {
          const fecha = new Date(horaInicial);
          const horasUTC = fecha.getUTCHours().toString().padStart(2, "0");
          const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, "0");
          const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

          horas = horas.filter((hora) => hora != horaFormateadaUTC);
        }
      }
      return res.status(200).json({ message: "Horas disponibles", horas });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const crearSeccion = async (req, res) => {
  try {
    const {
      edificio,
      aula,
      horaInicial,
      horaFinal,
      cupos,
      dias,
      nombreAsignatura,
    } = req.body;
    let { nombreDocente } = req.body;
    let partes = nombreDocente.split(" ");
    let nombres = partes[0] + " " + partes[1];
    let nombreAsignaturaParts = nombreAsignatura.substring(0, 4);
    const docenteFound = await docente.findOne({ where: { nombres } });
    const { numeroEmpleadoDocente, centroRegional } = docenteFound.dataValues;
    const asignaturaFound = await asignatura.findOne({
      where: { nombreClase: nombreAsignatura, centroRegional },
    });
    const { idAsignatura } = asignaturaFound.dataValues;
    let seccionInsert = {
      nombreSeccion: nombreAsignaturaParts,
      idAsignatura: idAsignatura,
      numeroEmpleadoDocente: numeroEmpleadoDocente,
      cupos: cupos,
      dias: dias,
      aula: aula,
      edificio: edificio,
      horaInicial: horaInicial,
      horaFinal: horaFinal,
      linkVideo: null,
      centroRegional: centroRegional,
    };
    const seccionCreated = await seccion.create(seccionInsert);
    return res.status(200).json({ message: "Seccion creada", seccionCreated });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};

export const obtenerEdificiosAuls = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const jefeCentro = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { centroRegional } = jefeCentro;
    const edificiosFound = await edificio.findAll({
      where: { centroRegional },
    });
    if (edificiosFound.length == 0) {
      return res.status(400).json({ message: "No hay edificios" });
    }
    let arrayEdificios = [];
    for (const edificio of edificiosFound) {
      const { idEdificio, nombreEdificio } = edificio;
      const aulasFound = await aula.findAll({ where: { idEdificio } });
      let arrayAulas = [];
      for (const aula of aulasFound) {
        const { numeroAula } = aula;
        arrayAulas.push(numeroAula);
      }
      let edificioInsert = {
        nombreEdificio: nombreEdificio,
        aulas: arrayAulas,
      };
      arrayEdificios.push(edificioInsert);
    }

    // crear pdf

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    let body = [["Edificio", "Aulas"]];
    for (const edificio of arrayEdificios) {
      const { nombreEdificio, aulas } = edificio;
      let aulasString = aulas.join(", ");
      let edificioInsert = [nombreEdificio, aulasString];
      body.push(edificioInsert);
    }
    let columnWidths = ["auto", "auto"];

    let docDefinition = {
      content: [
        {
          table: {
            widths: columnWidths,
            body: body,
          },
        },
      ],
    };
    let pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => {
      res.end(new Buffer(buffer, "base64"));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerSecciones = async (req, res) => {
  try {
    const { numeroEmpleadoDocente } = req.body;
    const jefeCentro = await docente.findOne({
      where: { numeroEmpleadoDocente },
    });
    const { centroRegional } = jefeCentro;
    const horasOcupadasDocente = await seccion.findAll({
      where: { centroRegional },
    });
    let arraySecciones = [];
    if (horasOcupadasDocente.length == 0) {
      return res.status(400).json({ message: "No hay secciones" });
    }
    for (const seccion of horasOcupadasDocente) {
      const { idAsignatura, numeroEmpleadoDocente } = seccion;
      const docenteFound = await docente.findOne({
        where: { numeroEmpleadoDocente },
      });
      const asignaturaFound = await asignatura.findOne({
        where: { idAsignatura },
      });

      const { nombres, apellidos } = docenteFound;
      const { codigoAsignatura, nombreClase } = asignaturaFound;
      let seccionInsert = {
        codigoAsignatura: codigoAsignatura,
        nombreClase: nombreClase,
        seccion: seccion,
        nombreCompletoProfesor: nombres + " " + apellidos,
      };
      arraySecciones.push(seccionInsert);
    }

    return res
      .status(200)
      .json({ message: "Secciones encontradas", arraySecciones });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const cancelacionSeccion = async (req, res) => {
  try {
    const { idSeccion, motivo } = req.body;
    const seccionFound = await seccion.findOne({ where: { idSeccion } });
    const { idAsignatura } = seccionFound.dataValues;
    const asignaturaFound = await asignatura.findOne({
      where: { idAsignatura },
    });
    const { nombreClase } = asignaturaFound.dataValues;
    let nombreSeccion = nombreClase + " " + idSeccion;
    const justificacion = await JustificacionCancelacionSeccion.create({
      nombreSeccion: nombreSeccion,
      justificacion: motivo,
    });
    const seccionDelete = await seccion.destroy({ where: { idSeccion } });
    return res
      .status(200)
      .json({ message: "Seccion cancelada", seccionDelete, justificacion });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const actualizarCuposSeccion = async (req, res) => {
  try {
    const { idSeccion, cupos } = req.body;
    const seccionUpdate = await seccion.update(
      { cupos: cupos },
      { where: { idSeccion } }
    );
    return res
      .status(200)
      .json({ message: "Seccion actualizada", seccionUpdate });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerListaEspera = async (req, res) => {
  try {
    const { idSeccion } = req.body;
    const listaEsperaFound = await listaEspera.count({ where: { idSeccion } });
    return res
      .status(200)
      .json({ message: "Lista de espera", listaEsperaFound });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const obtenerListaEsperaInfo = async (req, res) => {
  try {
    const { idSeccion } = req.body;
    const listaEsperaFound = await listaEspera.findAll({
      where: { idSeccion },
    });
    const listaEsperaInfo = [];
    for (const listaEspera of listaEsperaFound) {
      const { numeroCuenta } = listaEspera;
      const estudianteFound = await estudiante.findOne({
        where: { numeroCuenta },
      });
      const { nombres, apellidos } = estudianteFound;
      const indiceAcademicoFound = await indiceAcademico.findOne({
        where: { numeroCuenta },
      });
      const { indiceGlobal } = indiceAcademicoFound;
      let estudianteInsert = {
        numeroCuenta: numeroCuenta,
        nombreCompleto: nombres + " " + apellidos,
        indiceGlobal: indiceGlobal,
      };

      listaEsperaInfo.push(estudianteInsert);
    }
    return res
      .status(200)
      .json({ message: "Lista de espera", listaEsperaInfo });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const aceptarEstudianteListaEspera = async (req, res) => {
  try {
    const { numeroCuenta, idSeccion } = req.body;
    const fecha = new Date().getMonth();
    const año = new Date().getFullYear();
    let periodo = "";
    if (fecha == 1) {
      periodo = año + "-" + "I";
    } else if (fecha == 5) {
      periodo = año + "-" + "II";
    } else {
      periodo = año + "-" + "II";
    }

    const listaEsperaDelete = await listaEspera.destroy({
      where: { numeroCuenta, idSeccion },
    });
    const estudianteFound = await estudiante.findOne({
      where: { numeroCuenta },
    });
    const { carrera } = estudianteFound.dataValues;

    let matriculaInsertInfo = {
      idSeccion: idSeccion,
      nombreCarrera: carrera,
      numeroCuenta: numeroCuenta,
      calificacion: null,
      estado: "NA",
      periodo: periodo,
    };

    const matriculaCreate = matricula.create(matriculaInsertInfo);
    return res
      .status(200)
      .json({ message: "Estudiante aceptado", matriculaCreate });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
