import { estudiante } from "../models/estudianteModel.js";
import { matricula } from "../models/matriculaModel.js";
import { seccion } from "../models/seccionModel.js";
import { docente } from "../models/docenteModel.js";
import { solicitud } from "../models/solicitudesModel.js";
import { evaluacion } from "../models/evaluacionModel.js";
import { historial } from "../models/historialModel.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { enviarCorreo } from "../helpers/mailerManager.js";
import { asignatura } from "../models/asignaturaModel.js";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { forEach } from "underscore";
import multer from "multer";
import jwt from "jsonwebtoken";


// correoPersonal , claveEstudiante



const storage = multer.memoryStorage(); // Puedes cambiar esto según tus necesidades
export const  contUpload = multer({ storage: storage });



export const loginEstudiante = async (req, res) => {
  try {
    
    const { numeroCuenta, claveEstudiante } = req.body;
    let estudianteLogin = await estudiante.findOne({
      where: { numeroCuenta: numeroCuenta },
    });
    const hashedPassword = estudianteLogin.claveEstudiante;
    if (!estudianteLogin) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }
    const respuestaPassword = await comparePassword(
      claveEstudiante,
      hashedPassword
    );
    if (!respuestaPassword) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }

    const { token, expiresIn } = generateJWT(estudianteLogin.numeroCuenta);
    generateRefreshJWT(estudianteLogin.numeroCuenta, res);
    
    return res
      .status(200)
      .json({ message: "Login exitoso", token, expiresIn, estudianteLogin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
//...

export const getEstudiantes = async (req, res) => {
  try {
    if ((await estudiante.count()) === 0) {
      return res
        .status(400)
        .json({ message: "No hay estudiantes registrados" });
    }
    return res.status(200).json(await estudiante.findAll());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getEstudianteByCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteEspecifico = await estudiante.findOne({
      where: { numeroCuenta: id },
    });
    if (!estudianteEspecifico) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    return res.status(200).json(estudianteEspecifico);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const actualizarCarreraEstudiante = async (req, res) => {
  try {
    const { numeroCuenta, carrera } = req.body;
    await estudiante.update(
      { carrera: carrera, carreraSecundaria: null },
      { where: { numeroCuenta: numeroCuenta } }
    );
    return res.status(200).json({ message: "Carrera actualizada con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//proceso para recuperar cotraseña
//da click en recuperar contraseña->pone sus datos de numero de cuenta->se le envia un correo con la nueva contraseña
export const passwordResetMail = async (req, res) => {
  try {
    const numCuenta = req.body.numeroCuenta;
    const usuario = await estudiante.findOne({
      where: { numeroCuenta: numCuenta },
    });

    if (!usuario) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    console.log(usuario.dataValues);

    let nuevaClave =
      usuario.dataValues.centroRegional.slice(-2) +
      usuario.dataValues.nombres.slice(0, 1) +
      (Math.floor(Math.random() * 99) + 1).toString().padStart(2, "0") +
      usuario.dataValues.identidad.slice(-2);

    if (nuevaClave === usuario.dataValues.claveEstudiante) {
      nuevaClave =
        usuario.dataValues.nombres.slice(-2) +
        usuario.dataValues.Nombre.slice(0, 1) +
        (Math.floor(Math.random() * 99) + 1).toString().padStart(2, "0") +
        usuario.dataValues.identidad.slice(-2);
    }

    await usuario.update({ claveEstudiante: nuevaClave });

    enviarCorreo({
      from: "Sistema de registro UNAH",
      correo: usuario.dataValues.correoPersonal,
      asunto: "Recuperación de contraseña",
      Text: "Recuperación de contraseña",
      html: `
      <h1>Recuperación de contraseña</h1>
      <h2>Estimado ${usuario.dataValues.nombres} ${usuario.dataValues.apellidos}</h2>
      <h3>Usted a solicitado un cambio de contraseña la sigueiente sera su nueva contraseña de ahora en adelante</h3>
      <h3><strong>${nuevaClave}</strong></h3>
      `,
    });
    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//obtener informacion del estudiante por medio del jwt
export const getInfoByToken = async (req, res) => {
  try {

    //descoponemos el token 
    const token = req.headers.authorization.split(" ")[1];

    //sacamos el uid, iat, exp
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const estudianteInfo = await estudiante.findOne({
      where: { numeroCuenta: decoded.uid },
    }); 
    return res.status(200).json(estudianteInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

const InfoByToken = async (req, res) => {
  try {

    //descoponemos el token 
    const token = req.headers.authorization.split(" ")[1];

    //sacamos el uid, iat, exp
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const estudianteInfo = await estudiante.findOne({
      where: { numeroCuenta: decoded.uid },
    }); 
    return estudianteInfo.dataValues;
  } catch (error) {
    console.log(error);
  }
};


//obtener las notas obtenidas en las clase que matriculo durante el periodo.
export const getNotasPeriodo = async (req, res) => {
  try {
    let {numeroCuenta} = req.body;
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    }); 
    numeroCuenta = respuestasForm[0];

    if( await estudiante.findOne({where:{numeroCuenta:numeroCuenta}}) === null){
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    const notas = await matricula.findAll({
      where: { numeroCuenta: numeroCuenta }
    });
    if(notas.length === 0){
      return res.status(400).json({ message: "El estudiante no tiene notas" });
    }

    return res.status(200).json(notas);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
    
  }
};

//guardarEvaluacion sin token
export const guardarEvaluacion = async (req, res) => {
  try {
    const respuestasForm = []
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido)
    });

    console.log(respuestasForm[0,4]);
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:req.body.cuenta}});
    const matriculaid = await matricula.findOne({where:{numeroCuenta:infoEstudiante.dataValues.numeroCuenta}});
    const infoSeccion = await seccion.findOne({where:{idSeccion:matriculaid.dataValues.idSeccion}});
    const infoDocente = await docente.findOne({where:{numeroEmpleadoDocente:infoSeccion.dataValues.numeroEmpleadoDocente}});

    //console.log(infoEstudiante.dataValues,matriculaid.dataValues,infoSeccion.dataValues,infoDocente.dataValues);


    infoEstudiante === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;


    if(req.body == {}){
      return res.status(400).json({ message: "No se recibio nada" });
    }
    const evaluacionInput = new evaluacion({
      idMatricula: matriculaid.dataValues.idMatricula,
      idEstudiante: infoEstudiante.dataValues.numeroCuenta,
      idDocente: infoSeccion.dataValues.numeroEmpleadoDocente,
      respuestas: `${respuestasForm[0]},${respuestasForm[1]},${respuestasForm[2]},${respuestasForm[3]},${respuestasForm[4]}`,
      respuestaTexto1: respuestasForm[5],
      respuestaTexto2: respuestasForm[6],
      estado: true,
    });

    //posible modificacion por creacion de evaluaciones con la entrega de notas
    await evaluacionInput.save();

    return res.status(200).json({ message: "Evaluacion guardada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" },error);
  }
};

//multer para recibir formulario de cambio de carrera
export const contCambioCarrera = multer({ storage: storage });
//solicitudCambioCarrera sin token usar numero de cuenta
export const solicitudCambioCarrera = async (req, res) => {
  try {

    //0.cuenta 1.carreraCambio 2.justificacion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });

    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:respuestasForm[0]}});


    infoEstudiante === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;

    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Cambio de Carrera",
      recurso: null,
      diccionario : respuestasForm[1],
      justificacion: respuestasForm[2],
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: respuestasForm[0],
    });
    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }

};

//multer para recibir formulario de cambio de carrera
export const contCambioCentro = multer({ storage: storage });
//solicitudCambioCentro sin token usar numero de cuenta
export const solicitudCambioCentro = async (req, res) => {
  try {

    //0.cuenta 1.carreraCambio 2.justificacion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:infoEstudiante.dataValues.numeroCuenta}});


    infoEstudiante.dataValues === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;

    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Cambio de Centro",
      recurso: null,
      diccionario : respuestasForm[1],
      justificacion: respuestasForm[2],
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: infoEstudiante.dataValues.numeroCuenta,
    });
    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//multer para recibir formulario de Cancelacion Excepcional
const cancelacionPdf = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/solicitudes')
  },
  filename: function (req, file, cb) {
      cb(null, `${Date.now()}-cancelacion-${file.originalname}`)
  }
})

export const uploadPdf = multer({ storage: cancelacionPdf }).single('cancelacionPdf')

//solicitud de cancelacion de clases sin token usar numero de cuenta
export const solicitudCancelacionClases = async (req, res) => {
  try {
    //primer elemento:cuenta
    //elementos enmedio: clases
    //ultimo elemento: justificacion
    const respuestasForm = [];
    let clases = "";
    const archivo = req.file.path;
    //paso el conetnido del formulario a un array
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    }); 

    //saco las clases del array y las paso al array clases
    for (let index = 1; index < respuestasForm.length-1; index++) {
      clases = clases + respuestasForm[index] + ",";
    }

    //info del estudiante y matricula
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:respuestasForm[0]}});

    //creacion de la solicitud 

    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Cancelacion Excepcional",
      recurso: archivo,
      diccionario : clases,
      justificacion: respuestasForm[respuestasForm.length-1],
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: respuestasForm[0],
    });

    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//multer para recibir formulario de reposicion
export const contReposicion = multer({ storage: storage });

//solicitud de reposicion de clases sin token usar numero de cuenta
export const solicitudReposicion = async (req, res) => {
  try {
    //0.cuenta ,1.justificacion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:infoEstudiante.dataValues.numeroCuenta}});

    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Pago Reposicion",
      recurso: null,
      diccionario : null,
      justificacion: respuestasForm[1],
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: respuestasForm[0],
    });

    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
    
  }
};

export const clasesMatricula = async (req, res) => {
  try {
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});

    if (infoEstudiante === null || infoEstudiante === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }

    const infoHistorial = await historial.findAll ({where:{numeroCuenta:infoEstudiante.dataValues.numeroCuenta}});
    const infoClases = await asignatura.findAll({where:{nombreCarrera:infoEstudiante.dataValues.carrera}});

    
    let  clasesCarrera   = {}
    let  clasesHistorial = {}
    
    //añado las clases de la carrera y del historial a un objeto JSON
    forEach(infoClases, async (conetnido) => {
      clasesCarrera[`${conetnido.dataValues.idAsignatura}`] = conetnido.dataValues;
    });

    //en caso de que el estudiante no tenga ninguna clase en el historial se le envia un json con las clases de la carrera
    if (infoHistorial.length === 0 || infoHistorial === null || infoHistorial === undefined) {
      return res.status(400).json({ message: "El estudiante no tiene historial", clases : infoClases });
    }

    forEach(infoHistorial, async (conetnido) => {
      clasesHistorial[`${conetnido.dataValues.idAsignatura}`] = conetnido.dataValues;
    });

    //las clases presentes en el historial las busco en el json de las clases de la carrera y las quito
    forEach(infoHistorial, async (conetnido) => {
      delete clasesCarrera[conetnido.idAsignatura];
    });
    

    //devuelve un json con todas las clases que puede matricular el estudiante sin contar las que estan en el historial
    return res.status(200).json({ message: "Solicitud enviada con exito", clases : clasesCarrera});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//CRUD Matricula
//Create
export const createMatricula = async (req, res) => {
  try {
    //0.cuenta 1.idClase 2.idseccion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});
    const infoAsignatura = await asignatura.findOne({where:{idAsignatura:respuestasForm[1]}});
    const infoSeccion    = await seccion.findOne({where:{idSeccion:respuestasForm[2]}});

    if (infoEstudiante === undefined || infoAsignatura === undefined || infoSeccion === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    
    const nuevaMatricula = await matricula.create({
      idSeccion: infoSeccion.dataValues.idSeccion,
      nombreCarrera: infoAsignatura.dataValues.nombreCarrera,
      numeroCuenta: infoEstudiante.dataValues.numeroCuenta,
      calificacion: null,
      estado: "NSP",
      periodo: "I",
    });
    
    infoSeccion.update({cupos:infoSeccion.dataValues.cupos-1});
    nuevaMatricula.save();

    return res.status(200).json({ message: "Clase añadida con exito", clase: nuevaMatricula});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Read
export const readMatricula = async (req, res) => {
  try {
    //0.numero de cuenta
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });

    const infoMatricula = await matricula.findAll({where:{numeroCuenta:respuestasForm[0]}});

    if (infoMatricula === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    if (infoMatricula.dataValues === "{}") {
      return res.status(400).json({ message: "El estudiante no tiene clases matriculadas" });
    }

    return res.status(200).json({ message: "Clases Actuales", clasesMatriculadas: infoMatricula});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

//delete
export const deleteMatricula = async (req, res) => {
  try {
    //0.cuenta 1.idseccion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoSeccion    = await seccion.findOne({where:{idSeccion:respuestasForm[1]}});

    if (infoSeccion === undefined || infoSeccion.dataValues.idSeccion === null) {
      return res.status(400).json({ message: "no existe esta seccion" });
    }

    const claseMatriculada = await matricula.findOne({where:
      {
        idSeccion:infoSeccion.dataValues.idSeccion,
        numeroCuenta:respuestasForm[0]
      }
    });

    if (claseMatriculada === undefined) {
      return res.status(400).json({ message: "no tiene matriculada esta clase" });
    }
    
    await claseMatriculada.destroy();

    return res.status(200).json({ message: "clase canceladas", clase: claseMatriculada});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

//Notas despues de evaluar
export const notasDespuesEvaluacion = async (req, res) => {
  try {
    //0.cuenta
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEvaluacion = await evaluacion.findAll({where:{idEstudiante:respuestasForm[0]}});
    const infoClasesMatriculadas = await matricula.findAll({where:{numeroCuenta:respuestasForm[0]}});
    
    //obtengo todas las clases matriculadas
    let clases = {}
    forEach(infoClasesMatriculadas, async (conetnido) => {
      clases[`${conetnido.dataValues.idMatricula}`] = conetnido.dataValues;
    });

    //obtengo todas las evaluaciones del estudiante
    let evaluaciones = {}
    forEach(infoEvaluacion, async (conetnido) => {
      evaluaciones[`${conetnido.dataValues.idMatricula}`] = conetnido.dataValues;
    });

    //comparo cada clase matriculada con las evaluaciones de docente hechas del estudiante y si el valor de estado es true entonces se añaden a un array
    let clasesEvaluadas = {}
    forEach(infoClasesMatriculadas, async (conetnido) => {
      if(evaluaciones[`${conetnido.dataValues.idMatricula}`].estado === true){
        clasesEvaluadas[`${conetnido.dataValues.idMatricula}`] = conetnido.dataValues;
      }else{
        clasesEvaluadas[`${conetnido.dataValues.idMatricula}`] = "aun no a evaluado";
      }
    });


    return res.status(200).json({ message: "Notas Disponibles", notasClases: clasesEvaluadas});
  } catch (error) {
    console.log(error);
    return res.satatus(500).json({ message: "Error del servidor"});
  }
};
/*
metodo general para obtener info con token
usar la funcion infoByToken para obtener la info del estudiante que se encuentra logeado que retorna un objeto con la info del estudiante
*/