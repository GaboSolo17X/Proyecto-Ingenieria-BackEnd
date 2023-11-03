import multer from "multer";
import csv from 'csvtojson';
import mailer from '../config/confMailer.js';
import { json2csv } from 'json-2-csv';
import fs from 'fs';
import { forEach } from "underscore";
import { json } from "sequelize";


async function addAprovado(direccion,Identidad,NotaPAA,TipoExamen,NotaExamen){
fs.writeFile(direccion,`${String(Identidad)},${String(NotaPAA)},${String(TipoExamen)},${String(NotaExamen)}`+"\n", function (err) {});
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

        req.body.jsonArray = jsonArray;
        fs.appendFile(direccion, "Identidad,NotaPAA,TipoExamen,NotaExamen"+"\n" , function (err) {
            if (err) throw err;
            console.log(err);
          });

        // foreach para ejecutar el enviar el correo a cada aspiraten
        forEach(jsonArray, async (aspirante) => {
            
            
            const Identidad = aspirante["Identidad"];
            const notaPAA = aspirante["NotaPAA"];
            const tipoExamen = aspirante["TipoExamen"];
            const notaExamen = aspirante["NotaExamen"];
            const correo = ""
            const nombre = ""
            const tipo = (tipoExamen === undefined && notaExamen === undefined);


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
                await mailer.sendMail(mailOptions);  

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
                await mailer.sendMail(mailOptions);  
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
 

            //Accion para enviar directamente el correo
            await mailer.sendMail(mailOptions);
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
            await mailer.sendMail(mailOptions); 
            }
            

        });
        return res.status(200).json({ Archivos: "Archivo subido",AspirantesCSV:"creado",Correos:"correos enviados a estudiantes" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
    
};

//inutil
export const fecha = async (req,res) => {
    try {
        var fechas = new Date();
        return res.status(200).json({fecha:`${fechas.getFullYear()}/${fechas.getMonth()}/${fechas.getDate()}`});
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};


