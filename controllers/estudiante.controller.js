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
        const respuestaPassword = comparePassword(claveEstudiante, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(estudianteLogin.numeroCuenta);
        generateRefreshJWT(estudianteLogin.numeroCuenta, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};