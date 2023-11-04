import multer from "multer";
import csv from 'csvtojson';
import mailer from '../config/confMailer.js';
import fs from 'fs';
import { json2csv } from 'json-2-csv';
import { forEach, where } from "underscore";
import { aspirante } from "../models/aspiranteModel.js"
import { estudiante } from "../models/estudianteModel.js";
import { createObjectCsvWriter } from "csv-writer";


async function addAprovado(id,countestudiante){
    try {
        const aspirantes = await aspirante.findOne({
          where: { identidad: id },
        });
        const fecha = new Date();
        let numeroCuenta = "";
        //console.log(countestudiante);
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
            numeroCuenta =
            fecha.getFullYear().toString() + "100" + "0001";
        }

        const newEstudiante = new estudiante({
            numeroCuenta : numeroCuenta,
            nombres : aspirantes.dataValues.nombres,
            apellidos : aspirantes.dataValues.apellidos,
            identidad : aspirantes.dataValues.identidad,
            carrera : aspirantes.dataValues.carreraPrincipal,
            direccion : "sitio random de hondruas",
            correoPersonal : aspirantes.dataValues.correoPersonal,
            centroRegional : aspirantes.dataValues.centroRegional,
            claveEstudiante : id
        });
        const savedEstudiante = await newEstudiante.save();
    } catch (error) {
        console.log(error);

    }
};
//configuracion de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        req.body.nameFile = Date.now()+"-"+file.originalname;
        cb(null, req.body.nameFile)
    }
});


//inicializacion de multer con la configuracion de arriba
const upload = multer({ storage:storage });

//exportacion de la funcion subir para ser usada en el archivo de rutas
export const subir = upload.single("usrfile");

export const subirArchivo = async (req,res) => {
    try {
        
        /*procesamiento del archivo csv a un json con modulo csvtojson
        columnas en csv: Identidad,NotaPAA,TipoExamen,NotaExamen*/
        const direccion = `util/${Date.now()}-AspirantesAprobados.csv`
        const csvFilePath = `uploads/${req.file.filename}`;
        const jsonArray = await csv().fromFile(csvFilePath);
        const jsonArrayAprove = [];
        let ultimoEstudiante = await estudiante.count()
        
        req.body.jsonArray = jsonArray;
        /* fs.appendFile(direccion, "Identidad,NotaPAA,TipoExamen,NotaExamen"+"\n" , function (err) {
            if (err) throw err;
            console.log(err);
          }); */



    

        // foreach para ejecutar el enviar el correo a cada aspiraten
        forEach(jsonArray, async (aspirante) => {
            const Identidad = aspirante["Identidad"];
            const notaPAA = aspirante["NotaPAA"];
            const tipoExamen = aspirante["TipoExamen"];
            const notaExamen = aspirante["NotaExamen"];
            const correo = ""
            const nombre = ""
            const tipo = (tipoExamen === undefined && notaExamen === undefined);

            //console.log(jsonArrayAprove);
            let csvdata = ""
            

            //comprobacion de que el aspirante tenga un examen aparte de la paa y eparacion de estudiante segun el examen que tenga

            if (tipo) {
                
                if(notaPAA >= 70 ){
                    aspirante["TipoExamen"] = " ";
                    aspirante["NotaExamen"] = " ";
                    //Especificaciones del correo a enviar
                    const mailOptions = {
                    from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                    to: "weslinmbc"+"+"+correo+"@gmail.com",
                    subject: 'Usted aprovo el examen de admision',
                    Text: `Espero que se encuentre muy bien ${nombre}, le informamos que usted aprovo el examen de admision con una nota de ${notaPAA}`,
                    html: `<h1>Espero que se encuentre muy bien ${nombre}</h1><h2>le informamos que usted aprovo el examen de admision con una nota de ${notaPAA} muchas felicidades </h2>`,
                };


                ultimoEstudiante = ultimoEstudiante+1;
                //await addAprovado(Identidad,ultimoEstudiante)
                //await mailer.sendMail(mailOptions);  

                //añadidos al json
                jsonArrayAprove.push(aspirante);                
                }
                if(notaPAA < 70){
                    //Especificaciones del correo a enviar
                    const mailOptions = {
                        from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                        to: "weslinmbc"+"+"+correo+"@gmail.com",
                        subject: 'Usted no aprovo el examen de admision',
                        Text: `Espero que se encuentre muy bien ${nombre}, le informamos que usted no aprovo el examen de admision por una nota de ${notaPAA}`,
                        html: `<h1>Espero que se encuentre muy bien ${nombre}</h1><h2>le informamos que usted no aprovo el examen de admision por una nota de ${notaPAA}</h2>`,
                    };
                    
                        
                    //Accion para enviar directamente el correo
                    //await mailer.sendMail(mailOptions);  
                }
        }
            if(!tipo && notaPAA>70 && notaExamen>70){
                //Especificaciones del correo a enviar
                 const mailOptions = {
                    from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                    to: "weslinmbc"+"+"+correo+"@gmail.com",
                    subject: 'Usted aprovo el examen de admision',
                    Text: `Espero que se encuentre muy bien ${nombre}, le informamos que usted aprovo el examen de admision con una nota de ${notaPAA}`,
                    html: `<h1>Espero que se encuentre muy bien ${nombre}</h1><h2>le informamos que usted aprovo el examen de admision con una nota de ${notaPAA} muchas felicidades </h2>`,
                };
 
                ultimoEstudiante = ultimoEstudiante+1;
                //await addAprovado(Identidad,ultimoEstudiante);
                //Accion para enviar directamente el correo
               // await mailer.sendMail(mailOptions);
                //añaadido al json
                jsonArrayAprove.push(aspirante);
            }else{
                 const mailOptions = {
                    //Especificaciones del correo a enviar
                    from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                    to: "weslinmbc"+"+"+correo+"@gmail.com",
                    subject: 'Usted aprovo el examen de admision',
                    Text: `Espero que se encuentre muy bien ${nombre}, le informamos que usted aprovo el examen de admision con una nota de ${notaPAA}`,
                    html: `<h1>Espero que se encuentre muy bien ${nombre}</h1><h2>le informamos que usted aprovo el examen de admision con una nota de ${notaPAA} muchas felicidades </h2>`,

                    
                    
                };
            //Accion para enviar directamente el correo
            //await mailer.sendMail(mailOptions); 
            }
            const csvWriter = createObjectCsvWriter({
                path: direccion,
                header: [
                    {id: 'Identidad', title: 'Identidad'},
                    {id: 'NotaPAA', title: 'NotaPAA'},
                    {id: 'TipoExamen', title: 'TipoExamen'},
                    {id: 'NotaExamen', title: 'NotaExamen'}
                ]
            });
            csvWriter.writeRecords(jsonArrayAprove)    // returns a promise
                .then(() => {
                    console.log('...Done');
                }).catch((err) => {console.log(err)});

            console.log(jsonArrayAprove);


        });
        return res.status(200).json({ Archivos: "Archivo subido",AspirantesCSV:"creado",Correos:"correos enviados a estudiantes" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
    
};

//inutil
export const fecha = async (req,res) => {
    try {


        const ultimoAspirante = await estudiante.findAndCountAll().count
        console.log(ultimoAspirante.count);
        var fechas = new Date();
        return res.status(200).json({fecha:`${fechas.getFullYear()}/${fechas.getMonth()}/${fechas.getDate()}`});
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};


