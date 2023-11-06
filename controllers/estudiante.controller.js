import { estudiante} from "../models/estudianteModel.js"
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";

// correoPersonal , claveEstudiante

export const loginEstudiante = async (req, res) => {
    
    try {
        const { numeroCuenta, claveEstudiante } = req.body;
        let estudianteLogin = await estudiante.findOne({where: {numeroCuenta: numeroCuenta}})
        const  hashedPassword = estudianteLogin.claveEstudiante;
        if (!estudianteLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(claveEstudiante, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(estudianteLogin.numeroCuenta);
        generateRefreshJWT(estudianteLogin.numeroCuenta, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn , estudianteLogin});
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};
//...

export const getEstudiantes = async (req, res) => {
try {
    if(await estudiante.count() === 0){
        return res.status(400).json({ message: "No hay estudiantes registrados" });
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
    const estudianteEspecifico = await estudiante.findOne({where: {numeroCuenta: id}})
    if(!estudianteEspecifico){
        return res.status(400).json({ message: "El estudiante no existe" });
    }
    return res.status(200).json(estudianteEspecifico);
} catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
}
};


