
import {administrador} from "../models/administradorModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { estado_Proceso } from "../models/estadoProceso.js";
import bcrypt from "bcryptjs";

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

        // verificar las fechas de inicio y fin del proceso si ya pasarón la fecha de inicio y fin del proceso eliminar las fechas y cambiar el estado a false
        const estadoProcesos = await estado_Proceso.findAll();
        // fecha actual tiene que ser formato YYYY-MM-DD
        const fechaActual = new Date().toISOString().slice(0, 10);
        for (const estadoProceso of estadoProcesos) {
            const { idProceso} = estadoProceso.dataValues;
            if( fechaActual > estadoProceso.fechaInicioDelProceso && fechaActual > estadoProceso.fechaFinDelProceso){
                const estadoProcesoUpdtate = await estado_Proceso.update({fechaInicioDelProceso: null, fechaFinDelProceso: null, estado: false }, {where: {idProceso: estadoProceso.idProceso}})
            }
            
        }



        return res.status(200).json({ message: "Login exitoso", token, expiresIn, administrador: administradorLogin });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const hashPassword = async (req, res) => {
    try {
        const { clave } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(clave, salt);
        return res.status(200).json({ message: "Contraseña encriptada", clave: hashedPassword });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const actualizarEstadoProceso = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, idProceso } = req.body;
        const estadoProcesoUpdtate = await estado_Proceso.update({fechaInicioDelProceso: fechaInicio, fechaFinDelProceso: fechaFin, estado: true }, {where: {idProceso: idProceso}})
        return res.status(200).json({ message: "Estado de proceso actualizado", estadoProcesoUpdtate });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
}

export const ObtenerEstadoProceso = async (req, res) => {
    try{
        const estadoProcesos = await estado_Proceso.findAll();
        //  en la base de datos tengo en fechaInicioDelProceso y fechaFinDelProceso 2023-12-09 y 2023-12-16 pero cuando las recupero con findAll viene con un dia menos 2023-12-08 y 2023-12-15
        // por lo tanto le sumo un dia a cada fecha pero primero verifico que no sea null la fecha
        for (const estadoProceso of estadoProcesos) {
            if(estadoProceso.fechaInicioDelProceso != null){
                const fechaInicio = new Date(estadoProceso.fechaInicioDelProceso);
                fechaInicio.setDate(fechaInicio.getDate() + 1);
                estadoProceso.fechaInicioDelProceso = fechaInicio.toISOString().slice(0, 10);
            }
            if(estadoProceso.fechaFinDelProceso != null){
                const fechaFin = new Date(estadoProceso.fechaFinDelProceso);
                fechaFin.setDate(fechaFin.getDate() + 1);
                estadoProceso.fechaFinDelProceso = fechaFin.toISOString().slice(0, 10);
            }
        }
        
        return res.status(200).json({ message: "Estado de proceso", estadoProcesos });
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

