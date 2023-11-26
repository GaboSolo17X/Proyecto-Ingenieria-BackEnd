import { seccion } from "../models/seccionModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import { matricula } from "../models/matriculaModel.js";
import { historial } from "../models/historialModel.js";
import { docente } from "../models/docenteModel.js";
import { estudiante } from "../models/estudianteModel.js";
import mailer from "../config/confMailer.js";



export const obtenerClasesMatricula = async (req, res) => {
  try {
    const clasesMatricula = await seccion.findAll({
      include: [asignatura, docente]
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
    const { idSeccion, arrayEstudiantesNota, nombreClase } = req.body;

    for (const estudianteNota of arrayEstudiantesNota) {
      const { numeroCuenta, nota, estado } = estudianteNota;

      console.log(numeroCuenta)
      console.log(nota)
      console.log(estado)

      const updateMatricula =  await matricula.update(
        { calificacion: nota, estado: estado },
        { where: { numeroCuenta: numeroCuenta, idSeccion: idSeccion } }
      );

      console.log(updateMatricula);

      const estudianteFound = await estudiante.findOne({where:{numeroCuenta:numeroCuenta}});
      const { correoPersonal, nombres, apellidos } = estudianteFound.dataValues;
      const estudianteInfo = {};
      estudianteInfo["correo"] = correoPersonal;
      estudianteInfo["nombre"] = nombres + " " + apellidos;



      await enviarCorreo(estudianteInfo, {
        asunto: "Notas del periodo",
        texto:
          "Lamentamos informate que no has aprobado el examen de admision",
        html: `<html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
            }
            h1 {
              color: #333;
            }
            p {
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <h1>Un gusto saludarte, <strong>${estudianteInfo.nombre}</strong></h1>
          <p>Enviamos este correo para informarte que tu nota de ${nombreClase} ya se encuentra en el sistema de registro.</p>
          <p>Por favor, si aún no has evaluado a tus docentes, completa las mismas para poder ver las notas de todas tus clases.</p>
          <p>Sistema Registro UNAH</p>
        </body>
      </html>
                        `,
      });


    }

    res.status(200).json({ mensaje: "Notas subidas correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al subir nota" });
  }
};

export const obtenerNotasSeccion = async (req, res) => {
  const {idSeccion, numeroEmpleadoDocente} = req.body;
  const seccionFound = await seccion.findAll({where:{idSeccion:idSeccion, numeroEmpleadoDocente:numeroEmpleadoDocente}});
  const matriculasFound = await matricula.findAll({where:{idSeccion:idSeccion}});
  return res.status(200).json({seccion:seccionFound, matriculas:matriculasFound});
};

export async function enviarCorreo(estudiantes, info) {
  //funcion para elementos generico de envio de correo
  try {
    const mailOptions = {
      from: "Registro" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
      to: `${estudiantes.correo}`,
      subject: info.asunto,
      Text: info.texto,
      html: info.html,
    };
    await mailer.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}
