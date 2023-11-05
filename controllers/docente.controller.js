
import { docente } from "../models/docenteModel.js";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import jwt from "jsonwebtoken";
import multer from "multer";


const storageFotoCertificado = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/aspirantes')
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.nombres}_${req.body.apellidos}_fotoDocente.${file.originalname.split(".")[file.originalname.split(".").length-1]}`)
    }
})

export const upload = multer({ storage: storageFotoCertificado }).single('fotoDocente')


export const loginDocente = async (req, res) => {
    try {
        const { id, clave } = req.body;
        let docenteLogin = await docente.findOne({where: {numeroEmpleadoDocente: id}})
        const  hashedPassword = docenteLogin.claveDocente;
        if (!docenteLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(clave, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(docenteLogin.numeroEmpleadoDocente);
        generateRefreshJWT(docenteLogin.numeroEmpleadoDocente, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};

export const registerDocente = async (req, res) => {
    try {
        const { nombres,apellidos,identidad, nombreCarrera, centroRegional, correo }= req.body;
        //En caso de necesitar escribir el correo en el formulario cambiar el correo por el que se recibe en el body y eliminar la linea de abajo
        
        
        //Patron numero de docente 0201230519 0201<numero>
        const foto = req.file.path;
        if(!nombres || !apellidos || !identidad || !nombreCarrera || !centroRegional){
            //si el correo aplica a escribirse añari del lado del if || !correo
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
            console.log(docente.findOne({where: {identidad}}));
        }
        if(await docente.findOne({where: {identidad}})){
            
            return res.status(400).json({ message: "El docente ya existe" });
        }
        
        //el numero de empleado se crea con el patron 0201000001, 0201000002, 0201000003 
        let numeroEmpleadoDocente = ("000000" + (await docente.count()+1).toString()).slice(-6);
        numeroEmpleadoDocente = `0201${numeroEmpleadoDocente}`;

        if (docente.findOne({where: {numeroEmpleadoDocente}})) {
            numeroEmpleadoDocente++
        }

        const claveDocente = identidad.slice(-5)+apellidos.split(" ")[0]+nombres.split(" ")[0];
        const newDocente = new docente({
            numeroEmpleadoDocente,
            nombres,
            apellidos,
            identidad,
            foto,
            nombreCarrera,
            centroRegional,
            claveDocente,
            correo : `correo5unah+doce${numeroEmpleadoDocente}@gmail.com`
        });
        const savedDocente = await newDocente.save();
        return res.status(200).json({ message: "Docente creado", docente: savedDocente, contraseñaSinHashear: claveDocente});


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }   
};

export const getDocentes = async (req, res) => {
    try {
        if (await docente.count() === 0) return res.status(400).json({ message: "No hay docentes" });
        return res.status(200).json(await docente.findAll());
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }

};


//Busqueda de docentes en especifico util para despues
export const getDocenteByNumeroEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const docenteFound = await docente.findOne({ where: { numeroEmpleadoDocente: id } });
        if (!docenteFound) {
            return res.status(400).json({ message: "El docente no existe" });
        }
        return res.status(200).json({ message: "Docente encontrado", docente: docenteFound });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }

};
