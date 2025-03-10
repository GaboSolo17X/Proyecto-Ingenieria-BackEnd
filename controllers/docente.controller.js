
import { docente } from "../models/docenteModel.js";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { seccion } from "../models/seccionModel.js";
import { matricula } from "../models/matriculaModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import exceljs from "exceljs";
import path from "path";
import bcrypt from "bcrypt";

const storageFotoCertificado = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/aspirantes')
    },
    filename: function (req, file, cb) {
        cb(null, `${req.body.nombres}_${req.body.apellidos}_fotoDocente.${file.originalname.split(".")[file.originalname.split(".").length-1]}`)
    }
})

export const upload = multer({ storage: storageFotoCertificado }).single('fotoDocente')

const InfoByToken = async (req, res) => {
    try {
  
      //descoponemos el token 
      const token = req.body.token.split(" ")[1];
  
      //sacamos el uid, iat, exp
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const docenteInfo = await docente.findOne({
        where: { numeroEmpleadoDocente: decoded.uid },
      }); 
      return docenteInfo.dataValues;
    } catch (error) {
      console.log(error);
    }
  };

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

        return res.status(200).json({ message: "Login exitoso", token, expiresIn , docente: docenteLogin});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};

export const registerDocente = async (req, res) => {
    try {
        const { nombres,apellidos,identidad, nombreCarrera, centroRegional, correo }= req.body;
        //En caso de necesitar escribir el correo en el formulario cambiar el correo por el que se recibe en el body y eliminar la linea de abajo
        const num = '0201'
        
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
        let  numeroEmpleadoDocente = ("000000" + (await docente.count()+1).toString()).slice(-6);
        console.log(numeroEmpleadoDocente)
        if (docente.findOne({where: {numeroEmpleadoDocente}})) {
            numeroEmpleadoDocente = ("000000" + (await docente.count()+2).toString()).slice(-6);
        }
        numeroEmpleadoDocente = `${num}${numeroEmpleadoDocente}`;


        //<ultimos 5 digitos de la identidad><primer apellido><primer nombre>
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
        const docentes = await docente.findAll({limit: 5, order: [['numeroEmpleadoDocente', 'DESC']]});
        return res.status(200).json(docentes);
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

export const getSeccionesDocente = async (req, res) => {
    try {
        const { numeroEmpleadoDocente } = req.body;
        const secciones = await seccion.findAll({ where: { numeroEmpleadoDocente } });
        let asignaturas = []
        for (const seccion of secciones) {
            let asignaturasFound = await asignatura.findAll({ where: { idAsignatura: seccion.idAsignatura}})
            asignaturas.push(asignaturasFound)
        }
        if (secciones.length === 0) {
            return res.status(400).json({ message: "El docente no tiene secciones asignadas" });
        }
        return res.status(200).json({ message: "Secciones encontradas", secciones , asignaturas });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }

};

export const descargarListadoEstudiantes = async (req, res) => {
    try {
        
    let {idSeccion} = req.body;
    idSeccion = parseInt(idSeccion);
    const direccion = `util/listadoEstudiantes${idSeccion}.xlsx`;
    const datos = [];
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Listado de estudiantes");
    const seccionFound = await matricula.findAll({include: seccion, where: {idSeccion}, attributes: ["numeroCuenta"]});
    for (const seccion of seccionFound) {
        let estudianteFound = await estudiante.findOne({where: {numeroCuenta: seccion.dataValues.numeroCuenta}, attributes: ["nombres", "apellidos", 'numeroCuenta', 'correoPersonal'] });
        datos.push(estudianteFound.dataValues);
    }
    worksheet.columns = [
        { header: "Nombres", key: "nombres", width: 30 },
        { header: "Apellidos", key: "apellidos", width: 30 },
        { header: "Numero de Cuenta", key: "numeroCuenta", width: 30 },
        { header: "Correo", key: "correoPersonal", width: 30 },
    ];
    worksheet.addRows(datos);
    workbook.xlsx.writeFile(direccion).then(() => {
        enviarListadoEstudiantes(direccion, req, res);
    }).catch((error) => {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" }); 
    }

};

export const getEstudiantesSeccion = async (req, res) => {
    try {
        const { idSeccion } = req.body;
        console.log(idSeccion)
        const estudiantesSeccion = await matricula.findAll({ where: { idSeccion } });
        const estudiantes = [];

        for (const estudianteSeccion of estudiantesSeccion) {
            const { numeroCuenta } = estudianteSeccion.dataValues;
            
            const estudianteFound = await estudiante.findOne({ where: { numeroCuenta } });
            const { nombres, apellidos } = estudianteFound.dataValues;
            console.log( nombres, apellidos)

            estudiantes.push({ nombres, apellidos, numeroCuenta });
            
        }
        

        if (estudiantesSeccion.length === 0) {
            return res.status(400).json({ message: "No hay estudiantes en la seccion" });
        }
        return res.status(200).json({ message: "Estudiantes encontrados", estudiantes });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const enviarListadoEstudiantes = async (direccion, req, res) => {
    try {
        res.status(200).sendFile(path.resolve(direccion));
    } catch (error) {
        console.log(error);
    }
};

export const reinicioClaveDocente = async (req, res) => {
    try{
        const { numeroEmpleadoDocente, claveDocenteNueva } = req.body;
        const hashedPassword = await bcrypt.hash(claveDocenteNueva, 10);
        await docente.update({ claveDocente: hashedPassword }, { where: { numeroEmpleadoDocente } });
        return res.status(200).json({ message: "Clave reiniciada" });
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};