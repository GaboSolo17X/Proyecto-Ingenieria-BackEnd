import multer from "multer";
import csv from "csvtojson";
import mailer from "../config/confMailer.js";
import fs from "fs";
import { json2csv } from "json-2-csv";
import { forEach, where } from "underscore";
import { aspirante } from "../models/aspiranteModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { createObjectCsvWriter } from "csv-writer";
import { carrera } from "../models/carreraModel.js";
import bcrypt from "bcryptjs";
import path from "path";

/// SUBIR CSV

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    req.body.nameFile = Date.now() + "-" + file.originalname;
    cb(null, req.body.nameFile);
  },
});

const upload = multer({ storage: storage });

export const subir = upload.single("usrfile");

/// SUBIR ARCHIVO

export const subirArchivo = async (req, res) => {
  try {
    /*procesamiento del archivo csv a un json con modulo csvtojson
        columnas en csv: Identidad,NotaPAA,TipoExamen,NotaExamen*/
    const direccion = `util/${Date.now()}-AspirantesAprobados.csv`;
    const csvFilePath = `uploads/${req.file.filename}`;
    const jsonArray = await csv().fromFile(csvFilePath);
    const jsonArrayAprove = [];
    //let ultimoEstudiante = await estudiante.count()
    req.body.jsonArray = jsonArray;

    // foreach para ejecutar el enviar el correo a cada aspiraten
    forEach(jsonArray, async (aspirante) => {
      const Identidad = aspirante["Identidad"];
      const notaPAA = aspirante["NotaPAA"];
      const tipoExamen = aspirante["TipoExamen"];
      const notaExamen = aspirante["NotaExamen"];
      const tipo = tipoExamen === undefined && notaExamen === undefined;

      const aspiranteInfo = await infoAspirante(Identidad);
      let notaMinCarrera = await carrera.findOne({
        where: { nombreCarrera: aspiranteInfo.carrera },
      });
      notaMinCarrera = notaMinCarrera.dataValues.notaMinPAA;
      let notaMinExamenCarrera = await carrera.findOne({
        where: { nombreCarrera: aspiranteInfo.carrera },
      });
      notaMinExamenCarrera = notaMinExamenCarrera.dataValues.notaMinEx;

      if (aspiranteInfo === undefined) {
        return res.status(400).json({ message: "No se encontro al aspirante" });
      }
      if (notaPAA === undefined) {
        return res.status(400).json({
          message: `No se encontro nota de la PAA para el estudiante con identidad ${identidad}`,
        });
      }

      //comprobacion de que el aspirante tenga un examen aparte de la paa y eparacion de estudiante segun el examen que tenga
      //hacer un mensaje generico para cuando no pase examen y por tanto eviar

      //Solo necesito hacer paa
      if (tipo) {
        if (notaPAA >= notaMinCarrera) {
          //aprovado
          //añadidos al json
          aspiranteInfo.pasoCarreraPrincipal = true;
          jsonArrayAprove.push(aspiranteInfo);
          await enviarCorreo(aspiranteInfo, {
            asunto: "Aprobado",
            texto: "Felicidades, has aprobado el examen de admision",
            html: `
                            <h1>Felicidades ${aspiranteInfo.nombre}, has aprobado el examen de admision</h1>
                            <h2> Esperamos que te encuentres muy bien nos alegra informarte que has sido aprovado el examen de admision y has sido aceptado en la carrera de ${aspiranteInfo.carrera} con los siguientes resultados</h2>    
                            <h2>Nota PAA: ${notaPAA}</h2>
                            
                            <h2>Te esperamos en el centro regional ${aspiranteInfo.centro}</h2>
                            `,
          });
        }
        if (notaPAA < notaMinCarrera) {
          //no aprovado
          await enviarCorreo(aspiranteInfo, {
            asunto: "Examen de admision",
            texto:
              "Lamentamos informate que no has aprobado el examen de admision",
            html: `
                            <h1>Un gusto saludarte ${aspiranteInfo.nombre}, lamentamos informate que no has aprobado el examen de admision</h1>
                            <h2>Lastimosamente no has sido aprovado para ninguna de tus dos opciones de carrerae te esperamos que lo logros en otra ocsaion</h2>    
                            <h2>Nota PAA: ${notaPAA}</h2>
                            
                            <h2>Te esperamos en los proximos examenes un fallo es el camino al exito</h2>
                            `,
          });
        }
      }

      //Necesito hacer dos examenes
      if (!tipo) {
        if (notaPAA > notaMinCarrera && notaExamen > notaMinExamenCarrera) {
          //aprobo ambos examenes
          //añadir estudiante
          aspiranteInfo.pasoCarreraPrincipal = true;
          jsonArrayAprove.push(aspiranteInfo);
          //envio de correo
          await enviarCorreo(aspiranteInfo, {
            asunto: "Aprobado",
            texto: "Felicidades, has aprobado el examen de admision",
            html: `
                            <h1>Felicidades ${aspiranteInfo.nombre}, has aprobado el examen de admision</h1>
                            <h2> Esperamos que te encuentres muy bien nos alegra informarte que has sido aprovado el examen de admision y has sido aceptado en la carrera de ${aspiranteInfo.carrera} con los siguientes resultados</h2>    
                            <h2>Nota PAA: ${notaPAA}</h2>
                            <h2>Nota examen de carrera: ${notaExamen}</h2>
                            
                            <h2>Te esperamos en el centro regional ${aspiranteInfo.centro}</h2>
                            `,
          });
        }
        if (notaPAA > notaMinCarrera && notaExamen < notaMinExamenCarrera) {
          //aprobo paa pero no examen
          aspiranteInfo.pasoCarreraPrincipal = false;
          //añadido de estudiante al json
          jsonArrayAprove.push(aspiranteInfo);

          //envio de correo
          await enviarCorreo(aspiranteInfo, {
            asunto: "Examen de admision",
            texto: "Felicidades, has aprobado el examen de admision",
            html: `
                            <h1>Un gusto saludarte ${aspiranteInfo.nombre}, te tenemos noticias</h1>
                            <h2> Esperamos que te encuentres muy bien nos tenemos que informarte que no has sido aceptado en la carrera de ${aspirante.carrera} por una baja nota en el examen de la misma pero has sido aceptado en tu segunda opcion</h2>    
                            <h2>Nota PAA: ${notaPAA}</h2>
                            <h2>Nota examen de carrera: ${notaExamen}</h2>
                            
                            <h2>Te esperamos en el centro regional ${aspiranteInfo.centro}</h2>
                            `,
          });
        }
        if (notaPAA < notaMinCarrera && notaExamen < notaMinExamenCarrera) {
          //no aprovado
          //envio de correo
          await enviarCorreo(aspiranteInfo, {
            asunto: "Examen de admision",
            texto:
              "Lamentamos informate que no has aprobado el examen de admision",
            html: `
                            <h1>Un gusto saludarte <strong>${aspiranteInfo.nombre}<strong>, lamentamos informate que no has aprobado el examen de admision</h1>
                            <h2>Lastimosamente no has sido aprovado para ninguna de tus dos opciones de carrerae te esperamos que lo logros en otra ocsaion</h2>    
                            <h2>Nota PAA: ${notaPAA}</h2>
                            <h2>Nota examen de carrera: ${notaExamen}</h2>
                            
                            <h2>Te esperamos en los proximos examenes un fallo es el camino al exito</h2>
                            `,
          });
        }
      }

      const createCsvFile = () => {
        return new Promise((resolve, reject) => {
          const csvWriter = createObjectCsvWriter({
            path: direccion,
            header: [
              { id: "nombre", title: "Nombre" },
              { id: "Identidad", title: "Identidad" },
              { id: "carrera", title: "Carrera" },
              { id: "carreraSecundaria", title: "CarreraSecundaria" },
              { id: "correo", title: "CorreoPersonal" },
              { id: "centro", title: "Centro" },
              { id: "pasoCarreraPrincipal", title: "pasoCarreraPrincipal" },
            ],
          });

          csvWriter
            .writeRecords(jsonArrayAprove)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        });
      };

      await createCsvFile();
    });

    return res.status(200).json({
      Archivos: "Archivo subido",
      AspirantesCSV: "creado",
      Correos: "correos enviados a estudiantes",
      direccion: direccion,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

async function infoAspirante(id) {
  try {
    /*
        Funcion para obtener los datos del aspirante
        Id: la idea del aspirante
        return: un json con los datos del aspirante
        datos que contiene el json:
            Nombre completo,
            Identidad,
            Carrera a la que pertenece, 
            Dirección,
            Correo personal,
            Centro al que pertenece
        */ 1;
    if (id === undefined) {
      return res.status(400).json({ message: "No se envio una identidad" });
    }

    //buscar al aspirante en la base de datos
    const aspirantes = await aspirante.findOne({ where: { identidad: id } });
    //creacion del json
    const jsonAspirante = {};

    //llenado del json con los datos del aspirantes obtenidos del objeto aspirantes
    jsonAspirante["nombre"] =
      aspirantes.dataValues.nombres + " " + aspirantes.dataValues.apellidos;
    jsonAspirante["Identidad"] = aspirantes.dataValues.identidad;
    jsonAspirante["carrera"] = aspirantes.dataValues.carreraPrincipal;
    jsonAspirante["carreraSecundaria"] = aspirantes.dataValues.carreraSecundaria;
    jsonAspirante["direccion"] = "sitio random de hondruas";
    jsonAspirante["correo"] = aspirantes.dataValues.correoPersonal;
    jsonAspirante["centro"] = aspirantes.dataValues.centroRegional;
    jsonAspirante["pasoCarreraPrincipal"] = aspirantes.dataValues.pasoCarreraPrincipal;

    //retornar el json
    return jsonAspirante;
  } catch (error) {
    console.log(error);
  }
}

async function enviarCorreo(aspirante, info) {
  //funcion para elementos generico de envio de correo
  try {
    const mailOptions = {
      from: "Admisiones" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
      to: `${aspirante.correo}`,
      subject: info.asunto,
      Text: info.texto,
      html: info.html,
    };
    await mailer.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}

export const creacionEstudiantes = async (req, res) => {
  /*
    recibe csv-> lo paso a json ->de cada estudiante que paso saco si sus datos -> creo el estudiante -> guardo el estudiante en la base de datos
    */
  try {
    //direccion de origen del archivo csv
    const csvFilePath = `uploads/${req.file.filename}`;
    //conversion del archivo csv a json
    const jsonArray = await csv().fromFile(csvFilePath);
    let cuenta = await estudiante.count();
    forEach(jsonArray, async (aspirante) => {
      cuenta++;
      addAprovado(aspirante, cuenta);
    });
    return res.status(200).json({ message: "Estudiantes creados" });
  } catch (error) {
    console.log("Hubo un error el cual fue: ", error);
    return res.status(500).json({ message: error });
  }
};

async function addAprovado(aspirantes, countestudiante) {
  /*
    funcion asincronica para añadir estudiante a la base de datos a partir de la identidad del aspirante
    La mayor parte de la info se saca de la base de datos
    */
  try {
    const fecha = new Date();
    let claveEstudiante = "";
    let numeroCuenta = "";

    //deliminacion para el numero de cuenta estructura <año><periodo de examen><#estudiante>
    if (countestudiante <= 9) {
      numeroCuenta =
        fecha.getFullYear().toString() +
        "100" +
        "000" +
        countestudiante.toString();
    }
    if (countestudiante <= 99) {
      numeroCuenta =
        fecha.getFullYear().toString() +
        "100" +
        "00" +
        countestudiante.toString();
    }
    if (countestudiante >= 99 && countestudiante <= 999) {
      numeroCuenta =
        fecha.getFullYear().toString() +
        "100" +
        "0" +
        countestudiante.toString();
    }
    if (countestudiante >= 999) {
      numeroCuenta =
        fecha.getFullYear().toString() + "100" + countestudiante.toString();
    }
    if (countestudiante === 0) {
      numeroCuenta = fecha.getFullYear().toString() + "100" + "0001";
    }

    //<centro><inicialnombre><numero 1-99><ultimos dos numeros de la identidad
    //cu,curl,vs
    claveEstudiante =
      aspirantes.Centro.slice(-2) +
      aspirantes.Nombre.slice(0, 1) +
      (Math.floor(Math.random() * 99) + 1).toString().padStart(2, "0") +
      aspirantes.Identidad.slice(-2);

    let carreraSecundaria;
    let carreraPrincipal;
    if (aspirantes.pasoCarreraPrincipal == "true") {
      carreraSecundaria = aspirantes.CarreraSecundaria;
      carreraPrincipal = aspirantes.Carrera;
    } else {
      carreraSecundaria = null;
      carreraPrincipal = aspirantes.CarreraSecundaria;
    }

    const newEstudiante = new estudiante({
      numeroCuenta: numeroCuenta,
      nombres: aspirantes.Nombre,
      apellidos:
        aspirantes.Nombre.split(" ")[2] + " " + aspirantes.Nombre.split(" ")[3],
      identidad: aspirantes.Identidad,
      carrera: carreraPrincipal,
      direccion: "sitio random de hondruas",
      correoPersonal: aspirantes.CorreoPersonal,
      centroRegional: aspirantes.Centro,
      claveEstudiante: claveEstudiante,
      carreraSecundaria: carreraSecundaria,
    });

    //envio de correo al estudiante que se ha creado su cuenta

    const mailOptions = {
      from: "Registro" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
      to: `${aspirantes.CorreoPersonal}`,
      subject: "Creacion de usuario",
      Text: "Felicidades, Se ha Creado tu cuenta de estudiante",
      html: `
            <h1>Felicidades ${aspirantes.Nombre}, se ha creado tu usuario</h1>
            <h2> Esperamos que te encuentres muy bien nos alegra informarte que tu usuario ha sido creado en la universidad</h2>    
            <h2>Numero de cuenta: ${numeroCuenta}</h2>
            <h2>Clave de estudiante: ${claveEstudiante}</h2>
      
            <h2>Te esperamos en el centro regional ${aspirantes.Centro}</h2>
      `,
    };
    await mailer.sendMail(mailOptions);

    //guardado del estudiante en la base de datos
    const savedEstudiante = await newEstudiante.save();
  } catch (error) {
    console.log(error);
  }
}

export const enviarCSV = async (req, res) => {
  const archivoPath = req.body.direccion;
  res.sendFile(path.resolve(archivoPath));
};
