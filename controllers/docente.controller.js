
import { docente } from "../models/docenteModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";


export const loginDocente = async (req, res) => {
    try {
        const { numeroEmpleadoDocente, claveDocente } = req.body;
        let docenteLogin = await docente.findOne({where: {numeroEmpleadoDocente: numeroEmpleadoDocente}})
        const  hashedPassword = docenteLogin.claveDocente;
        if (!docenteLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(claveDocente, hashedPassword);
        console.log(respuestaPassword, " aqui es en loginDocente");
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
}