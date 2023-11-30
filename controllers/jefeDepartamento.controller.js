
import { jefeDepartamento } from "../models/jefeDepartamentoModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { docente } from "../models/docenteModel.js";
import { seccion } from "../models/seccionModel.js";
import { matricula } from "../models/matriculaModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { evaluacion } from "../models/evaluacionModel.js";
import mailer from "../config/confMailer.js";

export const loginJefeDepartamento = async (req, res) => {
    try {
        const { id, clave } = req.body;
        let jefeDepartamentoLogin = await jefeDepartamento.findOne({where: {numeroEmpleadoDocente : id}})
        const  hashedPassword = jefeDepartamentoLogin.claveJefe;
        if (!jefeDepartamentoLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(clave, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(jefeDepartamentoLogin.numeroEmpleadoDocente);
        generateRefreshJWT(jefeDepartamentoLogin.numeroEmpleadoDocente, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn,jefe:jefeDepartamentoLogin  });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
        
    }
}

export const notasIngresadasDocentesDepartamento = async (req, res) => {
    const { numeroEmpleadoDocente } = req.body ;
    const docentesFounds = await docente.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
    if(!docentesFounds){
        return res.status(400).json({ message: "No hay docentes" });
    };
    let notasSeccion = [];

    for (const docente of docentesFounds) {
        const  { numeroEmpleadoDocente } = docente;
        const  seccionesFound = await seccion.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
        if(!seccionesFound){
            return res.status(400).json({ message: "No hay secciones" });
        };
        for(const seccion of seccionesFound){
            const { idSeccion } = seccion;
            const  matriculasFound = await matricula.findAll({where: {idSeccion : idSeccion}});
            if(!matriculasFound){
                return res.status(400).json({ message: "No hay matriculas" });
            };
            const { calificacion , numeroCuenta, estado } = matriculasFound;
            const  estudianteFound = await estudiante.findOne({where: {numeroCuenta : numeroCuenta}});
            const { nombres , apellidos } = estudianteFound;
            notasSeccion.push({nombres,apellidos,numeroCuenta,calificacion,estado});
        }
    }
    return res.status(200).json({ message: "Notas de estudiantes", notasSeccion });

};

export const obtenerEvaluacionesDocentesDepartamento = async (req, res) => {
    const { numeroEmpleadoDocente } = req.body ;
    const evaluacionesFound = await evaluacion.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
    if(!evaluacionesFound){
        return res.status(400).json({ message: "No hay evaluaciones" });
    }
    return res.status(200).json({ message: "Evaluaciones de docentes", evaluacionesFound });
};  

export const ObtenerListadoEstudiantes = async (req, res) => {
    const { numeroEmpleadoDocente } = req.body ;
    const docentesFounds = await docente.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
    if(!docentesFounds){
        return res.status(400).json({ message: "No hay docentes" });
    };
    const { nombreCarrera } = docentesFounds;
    const matriculasFound = await matricula.findAll({where: {nombreCarrera : nombreCarrera}});
    if(!matriculasFound){
        return res.status(400).json({ message: "No hay matriculas" });
    }
    for( const matricula of matriculasFound){
        const { numeroCuenta } = matricula;
        const estudianteFound = await estudiante.findOne({where: {numeroCuenta : numeroCuenta}});
        const { nombres , apellidos } = estudianteFound;
        return res.status(200).json({ message: "Listado de estudiantes", nombres, apellidos, numeroCuenta });
    }
};

export const obtenerDocentes = async (req, res) => {
    const { numeroEmpleadoDocente } = req.body ;
    const docentesFounds = await docente.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
    if(!docentesFounds){
        return res.status(400).json({ message: "No hay docentes" });
    };
    const { nombreCarrera } = docentesFounds;
    const docentesFound = await docente.findAll({where: {nombreCarrera : nombreCarrera}});
    if(!docentesFound){
        return res.status(400).json({ message: "No hay docentes" });
    }
    return res.status(200).json({ message: "Docentes", docentesFound });
};

export const restablecerContraseña = async (req, res) => {
    const { numeroEmpleadoDocente } = req.body ;
    const docentesFounds = await docente.findAll({where: {numeroEmpleadoDocente : numeroEmpleadoDocente}});
    if(!docentesFounds){
        return res.status(400).json({ message: "No hay docentes" });
    };
    const { correo , nombres, apellidos } = docentesFounds;
    let docenteInfo = { correo , nombres, apellidos };
    const token = jwt.sign({ correo }, process.env.JWT_SECRET, {expiresIn : "2m"});
    const resetLink = `http://localhost:3000/restablecerContraseña/${token}`;
    const respuesta = await enviarCorreo(docenteInfo, resetLink);
    if(!respuesta){
        return res.status(400).json({ message: "No se pudo enviar el correo" });
    };
    return res.status(200).json({ message: "Correo enviado" });
};

export async function enviarCorreo(docente, resetLink) {
    //funcion para elementos generico de envio de correo
    try {
        const mailOptions = {
        from: "Admisiones" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
        to: `${docente.correo}`,
        subject: "Restablecer Clave'",
        Text: `Para restablecer tu clave, haz clic en el siguiente enlace: ${resetLink}`,
        html: `
                <h1>Un gusto saludarte <strong>${docente.nombre + " " + docente.apellidos}<strong>,</h1>
                <h2>Para restablecer tu clave, haz clic en el siguiente enlace: ${resetLink}</h2>    
                `,
        };
        await mailer.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}
