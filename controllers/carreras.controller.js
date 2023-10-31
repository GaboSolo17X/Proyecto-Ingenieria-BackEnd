import {carrera} from "../models/carreraModel.js";

export const getCarreras = async (req, res) => {

    try {
        const carreras = await carrera.findAll();
        res.status(200).json(carreras);
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Error en el servidor"})
    }
};