
import { jefeDepartamento } from "../models/jefeDepartamentoModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";

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

        return res.status(200).json({ message: "Login exitoso", token, expiresIn });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
}