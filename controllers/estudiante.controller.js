import { estudiante } from "../models/estudianteModel.js";
import { matricula } from "../models/matriculaModel.js";
import { solicitud } from "../models/solicitudesModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { enviarCorreo } from "../helpers/mailerManager.js";
import multer from "multer";
// correoPersonal , claveEstudiante

const cancelacionPdf = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/solicitudes')
  },
  filename: function (req, file, cb) {
      cb(null, `${Date.now()}-cancelacion-${file.originalname}`)
  }
})

export const uploadPdf = multer({ storage: cancelacionPdf }).single('cancelacionPdf')

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
    const {numeroCuenta,periodo} = req.body;
    if( await estudiante.findOne({where:{numeroCuenta:numeroCuenta}}) === null){
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    const notas = await matricula.findAll({
      where: { periodo: periodo },
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


//Guardar las evaluaciones de los docentes
export const guardarEvaluacion = async (req, res) => {
  try {
    const conetnido = req.body

    
    const info = await InfoByToken(req,res);
    info === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;
    if(conetnido == {}){
      return res.status(400).json({ message: "No se recibio nada" });
    }
    

    //To Do añadirlo a la base de datos

    return res.status(200).json({ message: "Evaluacion guardada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" },error);
  }
};

export const solicitudCambioCarrera = async (req, res) => {
  try {
    const { carreraCambio, justificacion } = req.body;
    const info = await InfoByToken(req,res);
    const solicitudID = await solicitud.count() + 1;
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:info.numeroCuenta}});


    info === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;

    const nuevaSolicitud = await solicitud.create({
      idSolicitud: solicitudID+"",
      tipoSolicitud: "Cambio de Carrera",
      recurso: "carreraCambio",
      diccionario : "nose",
      justificacion: justificacion,
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: info.numeroCuenta,
    });
    nuevaSolicitud.save();

    console.log(nuevaSolicitud.dataValues);
    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }

};


export const solicitudCambioCentro = async (req, res) => {
  try {
    const { centroCambio, justificacion } = req.body;
    const info = await InfoByToken(req,res);
    const solicitudID = await solicitud.count() + 1;
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:info.numeroCuenta}});


    info === "undefine" ? res.status(400).json({ message: "No se recibio nada" }) : null;

    const nuevaSolicitud = await solicitud.create({
      idSolicitud: solicitudID+"",
      tipoSolicitud: "Cambio de Centro",
      recurso: centroCambio,
      diccionario : "nose",
      justificacion: justificacion,
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: info.numeroCuenta,
    });
    nuevaSolicitud.save();

    console.log(nuevaSolicitud.dataValues);
    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


export const cancelacionClases = async (req, res) => {
  try {
    const contenido = req.body;
    const archivo = req.file.filename;

    //info del estudiante con el token
    const info = await InfoByToken(req,res);
    const solicitudID = await solicitud.count() + 1;
    const estudianteMatricula = await matricula.findOne({where:{numeroCuenta:info.numeroCuenta}});

    //creacion de la solicitud 

    const nuevaSolicitud = await solicitud.create({
      idSolicitud: solicitudID+"",
      tipoSolicitud: "Cancelacion Excepcional",
      recurso: archivo,
      diccionario : contenido.clases,
      justificacion: contenido.justificacion,
      idMatricula: estudianteMatricula.dataValues.idMatricula,
      numeroCuenta: info.numeroCuenta,
    });

    nuevaSolicitud.save();

    console.log(nuevaSolicitud.dataValues);

    return res.status(200).json({ message: "Solicitud enviada con exito" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};