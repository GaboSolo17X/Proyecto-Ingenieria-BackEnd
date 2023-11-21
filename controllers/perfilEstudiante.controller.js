import {perfilEstudiante} from "../models/perfilEstudianteModel.js";
import {fotoEstudiante} from "../models/fotoEstudianteModel.js";
import { forEach, object } from "underscore";
import multer from "multer";

const storage = multer.memoryStorage();

const storageFotoEstudiante = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/estudiantes')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})


export const  contPerfilEstudianteById = multer({ storage: storage });
export const perfilEstudianteById = async (req, res) => {
    try {
        //0.#cuentaEstudiante
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });

        const estudiante = await perfilEstudiante.findOne({ where: { numeroCuenta: formContenido[0] } });
        console.log(estudiante)
        if (!estudiante || estudiante.dataValues == undefined) {
            return res.status(400).json({ message: "Estudiante no existe" });
        }
        return res.status(200).json({ formContenido: estudiante.dataValues });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


export const contModPerfilEstudiante = multer({ storage: storage });
export const modPerfilEstudiante = async (req, res) => {
    try {
        //0.#cuentaEstudiante 1.fotoEstudiante 2.descripcion
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });
        
        const infoPerfilEstudiante = await perfilEstudiante.findOne({ where: { numeroCuenta: formContenido[0]}});
        
        if (await fotoEstudiante.findOne({ where: { idfotoEstudiante: formContenido[1]}}) == null) {
            return res.status(400).json({ message: "Foto no existe" });
        };

        infoPerfilEstudiante.update({
            idfotoEstudiante: formContenido[1],
            descripcion: formContenido[2]
        });

        
        console.log(infoPerfilEstudiante)
        return res.status(200).json({ message: "Perfil actualizado" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const contAñadirFoto = multer({ storage: storageFotoEstudiante }).single('fotoEstudiante');

export const añadirFoto = async (req, res) => {
    try {
        //0.#cuentaEstudiante 1.fotoEstudiante
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });
        console.log(formContenido,req.file.path)
        
        const fotosEstudiante = await fotoEstudiante.findAll({ where: { numeroCuenta: formContenido[0]}});
        if (fotosEstudiante.length >= 3) {
            return res.status(400).json({ message: "Ya hay 3 fotos no puede añadir otra mas" });
        }

        const nuevaFoto = await fotoEstudiante.create({
            numeroCuenta: formContenido[0],
            fotoEstudiante: req.file.path
        });
        
        
        return res.status(200).json({ message: "Foto añadida" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const contEliminarFoto = multer({ storage: storage });
export const eliminarFoto = async (req, res) => {
    try {
        //0.#cuentaEstudiante 1.fotoEstudiante
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });

        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
