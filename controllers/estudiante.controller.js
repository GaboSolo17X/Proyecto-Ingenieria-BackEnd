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
import { perfilEstudiante } from "../models/perfilEstudianteModel.js";
import { fotoEstudiante } from "../models/fotoEstudianteModel.js";
import {indiceAcademico} from "../models/indiceAcademicoModel.js";
import { listaEspera } from "../models/listaEsperaModel.js";
import {matriculaCancelada} from "../models/matriculaCanceladaModel.js"
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { forEach, isEmpty, isNull,object,isUndefined } from "underscore";
import multer from "multer";
import jwt from "jsonwebtoken";
import { carrera } from "../models/carreraModel.js";


const storage = multer.memoryStorage(); // Puedes cambiar esto según tus necesidades
export const  contUpload = multer({ storage: storage });

export const loginEstudiante = async (req, res) => {
  try {
    
    const { numeroCuenta, claveEstudiante } = req.body;
    let infoEstudiante = await estudiante.findOne({
      where: { numeroCuenta: numeroCuenta },
    });
    let estudiantePerfil = await perfilEstudiante.findOne({ where: { numeroCuenta: numeroCuenta } });
    let fotoPerfil = await fotoEstudiante.findOne({ where: { numeroCuenta: numeroCuenta } });


    if (isEmpty(fotoPerfil || isEmpty(estudiantePerfil))) {
      fotoPerfil = await fotoEstudiante.create({
        numeroCuenta: numeroCuenta,
        fotoEstudiante: "public/images/estudiantes/vacopio.jpg",
      });
      fotoPerfil.save();

      estudiantePerfil = await perfilEstudiante.create({
        numeroCuenta: numeroCuenta,
        idFotoEstudiante: fotoPerfil.dataValues.idFotoEstudiante,
        descripcion: "Sin descripcion",
      });
      estudiantePerfil.save();
    }
    
    const hashedPassword = infoEstudiante.claveEstudiante;
    if (!infoEstudiante) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }
    const respuestaPassword = await comparePassword(
      claveEstudiante,
      hashedPassword
    );
    if (!respuestaPassword) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }

    const { token, expiresIn } = generateJWT(infoEstudiante.numeroCuenta);
    generateRefreshJWT(infoEstudiante.numeroCuenta, res);

    let estudianteLogin = infoEstudiante.dataValues;
    estudianteLogin[`fotoPerfil`] = fotoPerfil.dataValues.fotoEstudiante
    
    return res
      .status(200)
      .json({ message: "Login exitoso", token, expiresIn, estudianteLogin});
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

    if(isNull(usuario)){
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    
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
export const getInfo = async (req, res) => {
  try {
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    }); 
    
    const estudianteInfo = await estudiante.findOne({
      where: { numeroCuenta: respuestasForm[0] },
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

    console.log(respuestasForm);
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[respuestasForm.length-2]}});
    const infoSeccion = await seccion.findOne({where:{idSeccion:respuestasForm[respuestasForm.length-1]}});
    const matriculaid = await matricula.findOne(
      {
        where:
        {
          numeroCuenta:respuestasForm[respuestasForm.length-2],
          idSeccion:respuestasForm[respuestasForm.length-1]
        }
      }
      );
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
      respuestas: `${respuestasForm[0]},${respuestasForm[1]},${respuestasForm[2]},${respuestasForm[3]}`,
      respuestaTexto1: respuestasForm[4],
      respuestaTexto2: respuestasForm[5],
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
      estado: "Pendiente"
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
      estado: "Pendiente"
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
    const respuestasForm = [];
    let clases = "";
    //paso el conetnido del formulario a un array
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    }); 
    console.log(respuestasForm)
    
    const archivo = req.file.path;
    
    //saco las clases del array y las paso al array clases
    for (let index = 1; index < respuestasForm.length-1; index++) {
      clases = clases + respuestasForm[index] + ",";
    }
    console.log(clases)
    //info del estudiante y matricula
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:respuestasForm[0]}});

    //confirmacion si el estudiante tiene la matricula 
    if (estudianteMatricula === "undefine" || estudianteMatricula.dataValues.idMatricula == null){
      console.log("no existe la matricula")
      return res.status(400).json({message:"no existe una matricula"})
    }

    
    //creacion de la solicitud 
    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Cancelacion Excepcional",
      recurso: archivo,
      diccionario : respuestasForm[1],
      justificacion: "",
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: respuestasForm[0],
      estado: "Pendiente"
    });

    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//multer para recibir formulario de reposicion
const contStorageReposicion = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/solicitudes')
  },
  filename: function (req, file, cb) {
      cb(null, `${Date.now()}-reposicion-${file.originalname}`)
  }
})

export const contReposicion = multer({ storage: contStorageReposicion }).single('pagoReposicion')
//solicitud de reposicion de clases sin token usar numero de cuenta
export const solicitudReposicion = async (req, res) => {
  try {
    //0.cuenta ,1.justificacion 2.imagne del recibo
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[0]}});
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:infoEstudiante.dataValues.numeroCuenta}});


    const archivo = req.file.path;


    const nuevaSolicitud = await solicitud.create({
      tipoSolicitud: "Pago Reposicion",
      recurso: archivo,
      diccionario : null,
      justificacion: respuestasForm[1],
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: respuestasForm[0],
      estado: "Pendiente"
    });

    nuevaSolicitud.save();

    return res.status(200).json({ message: "Solicitud enviada con exito" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
    
  }
};

//CRUD Matricula
//Create
export const contCreateMatricula = multer({ storage: storage });
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

    //verificar si el estudiante ya tiene la clase matriculada
    const veriMatricula = await matricula.findAll({where:{numeroCuenta:respuestasForm[0]}}) 
    if(!isNull(veriMatricula)){
      for(let clases of veriMatricula){
        const asignaturaSeccion = await seccion.findOne({where:{idSeccion:clases.dataValues.idSeccion}})
        if(infoAsignatura.dataValues.idAsignatura == asignaturaSeccion.dataValues.idAsignatura){
          return res.status(400).json({ message: "El estudiante ya tiene matriculada esta clase" });
        }
      }
    }
    

    //verificar si el estudiante ya tiene la clase matriculada en lista de espera
    const verListaEspera = await listaEspera.findAll({where:{numeroCuenta:respuestasForm[0]}}) 
    console.log(verListaEspera)
    if(!isNull(verListaEspera)){
      for(let clase of verListaEspera){
        const asignaturaSeccion = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}})
        if(infoSeccion.dataValues.idAsignatura == asignaturaSeccion.dataValues.idAsignatura){
          return res.status(400).json({ message: "El estudiante ya tiene esta clase en lista de espera" });
        }
      }
    }

    //verificar que las otras clases matriculadas no tengan el mismo horario
    for(let clase of veriMatricula){
      const infoSeccionMatriculada = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}});
      if(infoSeccionMatriculada.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] == infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] ){
        return res.status(400).json({ message: "Conflicto en el horario" });
      }
    }

    //verificar que las otras clases en lista de espera no tengan el mismo horario
    for(let clase of verListaEspera){
      const infoSeccionMatriculada = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}});
      if(infoSeccionMatriculada.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] == infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] ){
        return res.status(400).json({ message: "Conflicto en el horario" });
      }
    }
    
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();

    const nuevaMatricula = await matricula.create({
      idSeccion: infoSeccion.dataValues.idSeccion,
      nombreCarrera: infoEstudiante.dataValues.carrera,
      numeroCuenta: infoEstudiante.dataValues.numeroCuenta,
      calificacion: null,
      estado: "NSP",
      periodo: `${anio}-I`,
      
    });

      infoSeccion.update({cupos:infoSeccion.dataValues.cupos-1});
      nuevaMatricula.save();
      return res.status(200).json({ message: "Clase matriculada", clase: nuevaMatricula});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

//Read
export const contReadMatricula = multer({ storage: storage });
export const readMatricula = async (req, res) => {
  try {
    //0.numero de cuenta
    const respuestasForm = [];
    const clases = []
    const idAsignaturas = []
    const clasesMatriculadas = []

    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });

    const infoMatricula = await matricula.findAll({where:{numeroCuenta:respuestasForm[0]}});
    
    if (infoMatricula === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
      
    //proceso para obtener las secciones a travez de las matriculas 
    infoMatricula.forEach(element => {
      //añado las id de las secciones a un array llamado idAsignaturas
      clasesMatriculadas.push(element.dataValues);
      idAsignaturas.push(element.dataValues.idSeccion);
    })

    //obtengo la informacion de las secciones a travez de las idAsignaturas
    for(let i = 0; i < idAsignaturas.length; i++){
      const infoSeccion = await seccion.findOne({where:{idSeccion:idAsignaturas[i]}});
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:infoSeccion.dataValues.idAsignatura}});
      let informacion = infoSeccion.dataValues
      informacion.horaInicial = informacion.horaInicial.toISOString().split("T")[1].split(".")[0]
      informacion.horaFinal = informacion.horaFinal.toISOString().split("T")[1].split(".")[0]
      informacion.nombreClase = infoAsignatura.dataValues.nombreClase;
      clases.push(informacion);
    }
    
    if (clases == []) {
      return res.status(400).json({ message: "El estudiante no tiene clases matriculadas" });
    }
    
    return res.status(200).json({ message: "Clases Actuales", clasesMatriculadas: clases});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

//delete
export const contdeleteMatricula = multer({ storage: storage });
export const deleteMatricula = async (req, res) => {
  try {
    //0.cuenta 1.idseccion
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    const infoSeccion  = await seccion.findOne({where:{idSeccion:respuestasForm[1]}});
    const infoAsignatura = await asignatura.findOne({where:{idAsignatura:infoSeccion.dataValues.idAsignatura}});

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
    infoSeccion.update({cupos:infoSeccion.dataValues.cupos+1});

    const estudianteEnEspera = await listaEspera.findOne({where:{idSeccion:infoSeccion.dataValues.idSeccion}});
    if(!isEmpty(estudianteEnEspera)){
      if(estudianteEnEspera.length() >= 1){
        const estudiante = await estudiante.findOne({where:{numeroCuenta:estudianteEnEspera.dataValues.numeroCuenta}});
        const matricula = await matricula.create({
          idSeccion: infoSeccion.dataValues.idSeccion,
          nombreCarrera: infoSeccion.dataValues.nombreCarrera,
          numeroCuenta: estudiante.dataValues.numeroCuenta,
          calificacion: null,
          estado: "NSP",
          periodo: claseMatriculada.dataValues.periodo,
        });
        estudianteEnEspera.destroy();
    }
      matricula.save();

      const newMatriculaCancelada = await matriculaCancelada.create({
        codigoAsignatura:infoAsignatura.dataValues.codigoAsignatura,
        nombreClase:infoAsignatura.dataValues.nombreClase,
        periodo:claseMatriculada.dataValues.periodo,
        numeroCuenta:respuestasForm[0] 
      })
      newMatriculaCancelada.save()

      return res.status(200).json({ message: "clase cancelada y se puso a otro estudiante en su cupo", clase: claseMatriculada});
    }

    const newMatriculaCancelada = await matriculaCancelada.create({
      codigoAsignatura:infoAsignatura.dataValues.codigoAsignatura,
      nombreClase:infoAsignatura.dataValues.nombreClase,
      periodo:claseMatriculada.dataValues.periodo,
      numeroCuenta:respuestasForm[0] 
    })
    newMatriculaCancelada.save()

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

    console.log(respuestasForm)
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
    
    if(isEmpty(evaluaciones)){
      return res.status(400).json({ message: "Aun no hay evaluaciones"});
    }


    //comparo cada clase matriculada con las evaluaciones de docente hechas del estudiante y si el valor de estado es true entonces se añaden a un array
    
    let clasesEvaluadas = []
    for(let contenido of infoClasesMatriculadas){
      //console.log(evaluaciones[`${contenido.dataValues.idMatricula}`])
      if(isUndefined(evaluaciones[`${contenido.dataValues.idMatricula}`])){
        return res.status(400).json({ message: "Aun no a realizado todas sus evaluaciones"});
      }
      if(evaluaciones[`${contenido.dataValues.idMatricula}`].estado === false){
        return res.status(400).json({ message: "Aun no a realizado todas sus evaluaciones"});
      }
      const infoSeccion = await seccion.findOne({where:{idSeccion:contenido.dataValues.idSeccion}});
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:infoSeccion.dataValues.idAsignatura}});
      const infoDocente = await docente.findOne({where:{numeroEmpleadoDocente:infoSeccion.dataValues.numeroEmpleadoDocente}});

      let registro = {}

      registro["codigo"] = infoAsignatura.dataValues.codigoAsignatura
      registro["asignatura"] = infoAsignatura.dataValues.nombreClase
      registro["hi"] = infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0]
      registro["hf"] = infoSeccion.dataValues.horaFinal.toISOString().split("T")[1].split(".")[0]
      registro["dias"] = infoSeccion.dataValues.dias
      registro["profesor"] = infoDocente.dataValues.nombres + " " + infoDocente.dataValues.apellidos
      registro["calificacion"] = contenido.dataValues.calificacion
      registro["estado"] = contenido.dataValues.estado

      clasesEvaluadas.push(registro)
    };


    return res.status(200).json({ message: "Notas Disponibles", notasClases: clasesEvaluadas});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};
/*
metodo general para obtener info con token
usar la funcion infoByToken para obtener la info del estudiante que se encuentra logeado que retorna un objeto con la info del estudiante
*/

export const getCarreraMatricula = async (req, res) => {
  try {
    //0.numeroCuenta
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasReq[0]}});
    const carreras = await carrera.findAll();

    let carrerasDisponibles = []
    for(let carrera of carreras){
      const asignaturas = await asignatura.findAll({where:{nombreCarrera:carrera.dataValues.nombreCarrera}});
      for (let asignatura of asignaturas) {
        if(asignatura.dataValues.idCarrerasDisponibles.split(",").includes(infoEstudiante.dataValues.carrera) || asignatura.dataValues.idCarrerasDisponibles == "General"){
          carrerasDisponibles.push(carrera.dataValues);
          break;
        }
      }
    }
    return res.status(200).json({ message: "Carreras Disponibles", Departamentos: carrerasDisponibles});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const contgetAsignaturasMatricula = multer({ storage: storage });
export const getAsignaturasMatricula = async (req, res) => {
  try {
    //0.carrera
    //1.cuenta
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    //crea en un array llamado clases todas las asignaturas que pertenecen a la carrera
    const asignaturas = await asignatura.findAll({where:{nombreCarrera:respuestasForm[0]}});
    const historialClases = await historial.findAll({where:{numeroCuenta:respuestasForm[1]}});
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[1]}});
    
    

    let clases = {}
    let clasesHistorial = {}
    forEach(historialClases, async (conetnido) => {
      clasesHistorial[`${conetnido.dataValues.idAsignatura}`] = conetnido.dataValues;
    });

    
    forEach(asignaturas, async (conetnido) => {
      conetnido.dataValues.idCarrerasDisponibles.split(",").forEach(element => {
        if(element == infoEstudiante.dataValues.carrera || element == "general" || element == "General"){
          if(clasesHistorial[`${conetnido.dataValues.idAsignatura}`] == undefined || clasesHistorial[`${conetnido.dataValues.idAsignatura}`].estado != "APR"){
            clases[`${conetnido.dataValues.idAsignatura}`] = conetnido.dataValues;
          };
        }  
      });
    });
    console.log(clases)

    //sacar del historial todos los codigos de asignaturas de las clases del historial
    let requisitosCompletados = []
    for(let clase of historialClases){
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:clase.dataValues.idAsignatura}});
      //console.log(infoAsignatura.dataValues)
      requisitosCompletados.push(infoAsignatura.dataValues.codigoAsignatura)
    }
    console.log(requisitosCompletados)

    
    //comparar los requisitos de cada clase con los requisitos completados por el estudiante
    for (let clase in clases) {
      console.log("zas",clase.dataValues)
      if(clases[clase].requisitos == "General" || clases[clase].requisitos == "general" ){
        continue;
      }

      console.log(clase.dataValues)
      for(let requisito of clases[clase].requisitos.split(",")){
        console.log(requisitosCompletados, requisito)
        if(requisitosCompletados.includes(requisito) == false && requisito != null){
          delete clases[clase]
        }
      }
    }
    if(asignaturas == []){
      return res.status(400).json({ message: "No hay asignaturas disponibles" });
    }

    return res.status(200).json({ message: "Asignaturas Disponibles", asignaturas: clases});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

//metodo para obtener todas las secciones de una clases solo pide el id de la clase
export const contgetSeccionesDisponibles = multer({ storage: storage });
export const getSeccionesDisponibles = async (req, res) => {
  try {
    //0.idAsignatura 1.numeroCuenta
    const respuestasForm = [];
    forEach(req.body, async (conetnido) => {
      respuestasForm.push(conetnido);
    });
    console.log(respuestasForm)
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasForm[1]}});
    const contenidoSecciones = await seccion.findAll({where:{idAsignatura:respuestasForm[0]}});
    
    //console.log(contenidoSecciones)
    
    if(contenidoSecciones.length == 0){
      return res.status(200).json({ message: "No hay secciones disponibles" });
    }
    let secciones = []
    for(let seccion of contenidoSecciones){
    
      //console.log(seccion, infoEstudiante)
      if(seccion.dataValues.centroRegional !==  infoEstudiante.dataValues.centroRegional){
        continue;
      }
      let infoSeccion = seccion.dataValues;
      let infoDocente = await docente.findOne({where:{numeroEmpleadoDocente:seccion.dataValues.numeroEmpleadoDocente}})
      infoSeccion[`nombre`] = infoDocente.dataValues.nombres+" "+infoDocente.dataValues.apellidos
      infoSeccion[`fotoDocente`] = infoDocente.dataValues.foto
      secciones.push(infoSeccion)
    }

    return res.status(200).json({ message: "Secciones Disponibles", secciones: secciones});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const getIndiceAcademico = async (req,res) =>{
  try {
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });
    console.log(respuestasReq)
    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasReq[0]}});
    if (infoEstudiante === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    
    const indice = await indiceAcademico.findOne({where:{numeroCuenta:respuestasReq[0]}});
    
    if (indice === undefined) {
      return res.status(400).json({ message: "El estudiante no tiene indice" });
    }

    return res.status(200).json({indiceAcademico: indice.dataValues.indiceGlobal});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
}

export const addListaEspera = async (req,res) =>{
  try {
    //0.idSeccion 1.numeroCuenta  
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });

    const infoEstudiante = await estudiante.findOne({where:{numeroCuenta:respuestasReq[1]}});

    if (infoEstudiante === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }

    const infoSeccion = await seccion.findOne({where:{idSeccion:respuestasReq[0]}});

    if (infoSeccion === undefined) {
      return res.status(400).json({ message: "La seccion no existe" });
    }


    //verificar si el estudiante ya tiene la clase en esa lista de espera 
   const verListaEspera = await listaEspera.findAll({where:{numeroCuenta:respuestasReq[1]}}) 
    if(!isNull(verListaEspera)){
      for(let clase of verListaEspera){
        const asignaturaSeccion = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}})
        if(infoSeccion.dataValues.idAsignatura == asignaturaSeccion.dataValues.idAsignatura){
          return res.status(400).json({ message: "El estudiante ya tiene esta clase en lista de espera" });
        }
      }
    }
     //verificar si el estudiante ya tiene la clase matriculada
     const veriMatricula = await matricula.findAll({where:{numeroCuenta:respuestasReq[1]}}) 
     if(!isNull(veriMatricula)){
       for(let clases of veriMatricula){
         const asignaturaSeccion = await seccion.findOne({where:{idSeccion:clases.dataValues.idSeccion}})
         if(infoSeccion.dataValues.idAsignatura == asignaturaSeccion.dataValues.idAsignatura){
           return res.status(400).json({ message: "El estudiante ya tiene matriculada esta clase" });
         }
       }
     }

     //Verificar que el horario no choque con las clases matriculadas
     for(let clase of veriMatricula){
       const infoSeccionMatriculada = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}});
       if(infoSeccionMatriculada.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] == infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] ){
         return res.status(400).json({ message: "Conflicto en el horario" });
       }
     }

     //verificar que las clases no choquen con las clases en lista de espera
     for(let clase of verListaEspera){
      const infoSeccionMatriculada = await seccion.findOne({where:{idSeccion:clase.dataValues.idSeccion}});
      if(infoSeccionMatriculada.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] == infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0] ){
        return res.status(400).json({ message: "Conflicto en el horario" });
      }
    }

    const registroListaEspera = await listaEspera.create({
      idSeccion: infoSeccion.dataValues.idSeccion,
      numeroCuenta: infoEstudiante.dataValues.numeroCuenta,
    });

    registroListaEspera.save();

    return res.status(200).json({ message: "Se ha registrado en la lista de espera" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const deleteListaEspera = async (req,res) =>{
  try {
    //0.idlistaEspera
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });

    console.log(respuestasReq)

    const infoListaEspera = await listaEspera.findOne({where:{idListaEspera:respuestasReq[0]}});

    if (infoListaEspera === undefined) {
      return res.status(400).json({ message: "El registro no existe" });
    }

      const infoSeccion = await seccion.findOne({where:{idSeccion:infoListaEspera.dataValues.idSeccion}});
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:infoSeccion.dataValues.idAsignatura}});
      const claseMatriculada = await matricula.findOne({where:{idSeccion:infoListaEspera.dataValues.idSeccion}});

    const newMatriculaCancelada = await matriculaCancelada.create({
      codigoAsignatura:infoAsignatura.dataValues.codigoAsignatura,
      nombreClase:infoAsignatura.dataValues.nombreClase,
      periodo:claseMatriculada.dataValues.periodo,
      numeroCuenta:infoListaEspera.dataValues.numeroCuenta
    })
    newMatriculaCancelada.save()


    await infoListaEspera.destroy();


    return res.status(200).json({ message: "Se ha eliminado de la lista de espera" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const getListaEspera = async (req,res) =>{
  try {
    //0.numeroCuenta
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });
    //nombreClase, Aula, Edificio, Dias, HoraInicio, HoraFinal
    const clasesEspera = await listaEspera.findAll({where:{numeroCuenta:respuestasReq[0]}});
    if (clasesEspera === undefined) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }

    
    let listaEsperaEstudiante = []
    for(let registro of clasesEspera){
      const infoSeccion = await seccion.findOne({where:{idSeccion:registro.dataValues.idSeccion}});
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:infoSeccion.dataValues.idAsignatura}});
      let info = {}
      info["idListaEspera"] = registro.dataValues.idListaEspera
      info["nombreClase"] = infoAsignatura.dataValues.nombreClase;
      info["Aula"] = infoSeccion.dataValues.aula;
      info["Edificio"] = infoSeccion.dataValues.edificio;
      info["Dias"] = infoSeccion.dataValues.dias;
      info["HoraInicio"] = infoSeccion.dataValues.horaInicial.toISOString().split("T")[1].split(".")[0]
      info["HoraFinal"] = infoSeccion.dataValues.horaFinal.toISOString().split("T")[1].split(".")[0];
      listaEsperaEstudiante.push(info);
    }

    console.log(listaEsperaEstudiante)
    return res.status(200).json({ListaDeClasesEnEspera: listaEsperaEstudiante});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const getInfoSeccion = async (req,res) =>{
  try {
    //0.idSeccion
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });


    const infoSeccion = await seccion.findOne({where:{idSeccion:respuestasReq[0]}});
    const infoDocente = await docente.findOne({where:{numeroEmpleadoDocente:infoSeccion.dataValues.numeroEmpleadoDocente}});

    if (infoSeccion === undefined || infoDocente === undefined) {
      return res.status(400).json({ message: "La seccion o el docente no existe" });
    }

    let info = {}
    info["nombre"] = infoDocente.dataValues.nombres+" "+infoDocente.dataValues.apellidos;
    info["fotoDocente"] = infoDocente.dataValues.foto;
    info["videoSeccion"] = infoSeccion.dataValues.linkVideo;
    console.log(info)

    return res.status(200).json({infoDocenteSeccion: info});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const clasesCanceladas = async (req, res) =>{
  try {
    //0.numeroCuenta
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });

    const listaClases = await matriculaCancelada.findAll({where:{numeroCuenta:respuestasReq[0]}});
  
    if(isNull(listaClases)){
      return res.status(400).json({ message: "no hay clases canceladas registradas" });
    }

    return res.status(200).json({ clases: listaClases });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error del servidor"});
  }
}

export const getInfoEvaluacion = async (req,res) =>{
  try {
    //0.idSeccion 1.numeroCuenta
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });


    const infoSeccion = await seccion.findOne({where:{idSeccion:respuestasReq[0]}});
    const infoDocente = await docente.findOne({where:{numeroEmpleadoDocente:infoSeccion.dataValues.numeroEmpleadoDocente}});
    const infoMatricula = await matricula.findOne({where:{numeroCuenta:respuestasReq[1],idSeccion:respuestasReq[0]}});

    if (infoSeccion === undefined || infoDocente === undefined) {
      return res.status(400).json({ message: "La seccion o el docente no existe" });
    }

    let info = {}
    info["nombre"] = infoDocente.dataValues.nombres+" "+infoDocente.dataValues.apellidos;
    info["fotoDocente"] = infoDocente.dataValues.foto;
    info["videoSeccion"] = infoSeccion.dataValues.linkVideo;

    const infoEvaluacion = await evaluacion.findOne({where:{idMatricula:infoMatricula.dataValues.idMatricula}});
    if(isNull(infoEvaluacion)){
      //no encontro evaluacion entonces si puede hacerla 
      info["estado"] = false;
    }else{
      //si encontro evaluacion entonces no puede hacerla
      info["estado"] = true;
    }

    return res.status(200).json({infoDocenteSeccion: info});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error del servidor"});
  }
};

export const infoCertificado = async (req,res) =>{
  try {
    //0.numeroCuenta
    const respuestasReq = [];
    forEach(req.body, async (conetnido) => {
      respuestasReq.push(conetnido);
    });
    const infoSolisitud = []
    const infoHistorial = await historial.findAll({where:{numeroCuenta:respuestasReq[0]}});
    if(isNull(infoHistorial)){
      return res.status(400).json({ message: "no hay clases en el historial" });
    }
    
    for(let registro of infoHistorial) {
      let info = {}
      const infoAsignatura = await asignatura.findOne({where:{idAsignatura:registro.dataValues.idAsignatura}});
      info["name"] = infoAsignatura.dataValues.codigoAsignatura
      info["asignatura"] = infoAsignatura.dataValues.nombreClase.toUpperCase()
      info["cali"] = registro.dataValues.calificacion
      info["uv"] = infoAsignatura.dataValues.uv

      switch (registro.dataValues.periodo.split("-")[1]) {
        case "I":
          info["periodo"] = "Primer Periodo"
          break;
        case "II":
          info["periodo"] = "Segundo Periodo"
          break;
        case "III":
          info["periodo"] = "Segundo Periodo"
          break;
        default:
          console.log("error de algun tipo")
          break;
      }
      
      info["anio"] = registro.dataValues.periodo.split("-")[0]
      infoSolisitud.push(info)
    }; 


    return res.status(200).json({infoCertificado: infoSolisitud});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error del servidor"});
  }
}
