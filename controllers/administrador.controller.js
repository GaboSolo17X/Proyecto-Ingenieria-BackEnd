
import {administrador} from "../models/administradorModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";

export const loginAdministrador = async (req, res) => {

    try {
        const { id, clave } = req.body;
        let administradorLogin = await administrador.findOne({where: {numeroEmpleadoAdministrador: id}})
        const  hashedPassword = administradorLogin.claveAdministrador;
        if (!administradorLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(clave, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(administradorLogin.numeroEmpleadoAdministrador);
        generateRefreshJWT(administradorLogin.numeroEmpleadoAdministrador, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn, administrador: administradorLogin });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};