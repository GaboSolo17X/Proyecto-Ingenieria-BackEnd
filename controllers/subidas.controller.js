import multer from "multer";
import csv from 'csvtojson';
import mailer from '../config/confMailer.js';
import { forEach } from "underscore";


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

        //procesamiento del archivo csv a un json con modulo csvtojson
        const csvFilePath = `uploads/${req.file.filename}`;
        const jsonArray = await csv().fromFile(csvFilePath);
        req.body.jsonArray = jsonArray;

        console.log(jsonArray);

        // foreach para ejecutar el enviar el correo a cada aspiraten
        forEach(jsonArray, async (aspirante) => {
            const useNombre = aspirante["nombre"];
            const useCorreo = aspirante["correo"];
            const useNota = aspirante["nota"];

            //Seleccion entre tipo de estudiante si paso o no con mensaje personalizado
            if(useNota >= 70){

                //Añadir a base de datos


                //Especificaciones del correo a enviar
                const mailOptions = {
                from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                to: "weslinmbc"+"+"+useNombre+"@gmail.com",
                subject: 'Usted aprovo el examen de admision',
                Text: `Espero que se encuentre muy bien ${useNombre}, le informamos que usted aprovo el examen de admision con una nota de ${useNota} para la carrera de ${aspirante["carrera"]}`,
                html: `<h1>Espero que se encuentre muy bien ${useNombre}</h1><p>le informamos que usted aprovo el examen de admision con una nota de ${useNota} para la carrera de ${aspirante["carrera"]}</p>`,
            };
            await mailer.sendMail(mailOptions); 

            }

            if(useNota < 70){
                //Especificaciones del correo a enviar
                const mailOptions = {
                    from: 'Admisiones' + '<' + process.env.EMAIL_USER + "@gmail.com" +'>',
                    to: "weslinmbc"+"+"+useNombre+"@gmail.com",
                    subject: 'Usted no aprovo el examen de admision',
                    Text: `Espero que se encuentre muy bien ${useNombre}, le informamos que usted no aprovo el examen de admision con una nota de ${useNota} para la carrera de ${aspirante["carrera"]}`,
                    html: `<h1>Espero que se encuentre muy bien ${useNombre}</h1><p>le informamos que usted no aprovo el examen de admision con una nota de ${useNota} para la carrera de ${aspirante["carrera"]}</p>`,
                };
                //Accion para enviar directamente el correo
                await mailer.sendMail(mailOptions); 
                
            }
        });
        return res.status(200).json({ Archivos: "Archivo subido", Correos:"correos enviados a estudiantes" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
    
};


