import { cordinadorDocente } from "../models/coordinadorModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";

// correoPersonal , claveEstudiante

export const loginCoordinador = async (req, res) => {
    
    try {
        const { numeroEmpleadoDocente, claveCoordinador } = req.body;
        let coordinadorLogin = await cordinadorDocente.findOne({where: {numeroEmpleadoDocente: numeroEmpleadoDocente}})
        const  hashedPassword = coordinadorLogin.claveCoordinador;
        if (!coordinadorLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = comparePassword(claveCoordinador, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(coordinadorLogin.numeroEmpleadoDocente);
        generateRefreshJWT(coordinadorLogin.numeroEmpleadoDocente, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};