import { aspirante } from "../models/aspiranteModel.js";

//vacio porque es para prueba de rutas y añadir tabla de aspirante a la base de datos
export const crearAspirante = async (req, res) => {
    try {
        return res.status(200).json({ message: "Aspirante creado exitosamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al crear aspirante" });
    }
};