import {perfilEstudiante} from "../models/perfilEstudianteModel.js";
import {fotoEstudiante} from "../models/fotoEstudianteModel.js";
import {estudiante} from "../models/estudianteModel.js";
import { find, forEach, isEmpty, object } from "underscore";
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
        
        //verificar si existe fotoEstudiante o descripcion
        if(isEmpty(formContenido[1]) && isEmpty(formContenido[2])){
            return res.status(400).json({ message: "no hay nada que actualizar" });
        }

        const infoPerfilEstudiante = await perfilEstudiante.findOne({ where: { numeroCuenta: formContenido[0]}});

        if(isEmpty(formContenido[1]) && !isEmpty(formContenido[2])){
            infoPerfilEstudiante.update({
                descripcion: formContenido[2]
            });
            return res.status(200).json({ message: "Se actualizo la descripcion" });
        };

        const infoFotoEstudiante = await fotoEstudiante.findOne({ where: { idfotoEstudiante: formContenido[1]}});

        if(!isEmpty(formContenido[1]) && isEmpty(formContenido[2])){
            if (infoFotoEstudiante == null) {
                return res.status(400).json({ message: "Foto no existe" });
            };
            if(infoPerfilEstudiante.dataValues.numeroCuenta !== infoFotoEstudiante.dataValues.numeroCuenta){
                return res.status(400).json({ message: "Foto no pertenece a estudiante" });
            }
            infoPerfilEstudiante.update({
                idfotoEstudiante: formContenido[1]
            });
            return res.status(200).json({ message: "Se actualizo la foto" });
        }


        if(infoPerfilEstudiante.dataValues.numeroCuenta !== infoFotoEstudiante.dataValues.numeroCuenta){
            return res.status(400).json({ message: "Foto no pertenece a estudiante" });
        }
        
        if (await fotoEstudiante.findOne({ where: { idfotoEstudiante: formContenido[1]}}) == null) {
            return res.status(400).json({ message: "Foto no existe" });
        };

        
        infoPerfilEstudiante.update({
            idfotoEstudiante: formContenido[1],
            descripcion: formContenido[2]
        });

        
        console.log(infoPerfilEstudiante.dataValues)
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
        //0.#cuentaEstudiante 1.idfotoEstudiante
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });

        const imagenEstudiante = await fotoEstudiante.findOne({ where: { idfotoEstudiante: formContenido[1]}});
        if (imagenEstudiante == null) {
            return res.status(400).json({ message: "Foto no existe" });
        };
        if (imagenEstudiante.dataValues.numeroCuenta !== formContenido[0]) {
            return res.status(400).json({ message: "Foto no pertenece a estudiante" });
        };
        imagenEstudiante.destroy();
        
        return res.status(200).json({ message: "Foto eliminada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const contGetFotosEstudianes = multer({ storage: storage });
export const getFotosEstudianes = async (req, res) => {
    try {
        //numero de cuenta
        const formContenido = []
        forEach(req.body,async (elemento) => {
            formContenido.push(elemento)
        });

        const fotosEstudiante = await fotoEstudiante.findAll({ where: { numeroCuenta: formContenido[0]}});
        if(fotosEstudiante.length == 0){
            return res.status(400).json({ message: "No hay fotos" });
        }

        return res.status(200).json({ fotos: fotosEstudiante });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const actualizarLocalStorage = async (req, res) => {
    try {
      const { numeroCuenta } = req.body;
      let estudianteLogin = await estudiante.findOne({where: { numeroCuenta: numeroCuenta }});
      let estudiantePerfil = await perfilEstudiante.findOne({ where: { numeroCuenta: numeroCuenta } });
      let fotoPerfil = await fotoEstudiante.findOne({ where: { numeroCuenta: estudiantePerfil.dataValues.idfotoEstudiante }});
      
    let infoEstudiante = estudianteLogin.dataValues;
    infoEstudiante[`fotoPerfil`] = fotoPerfil.dataValues.fotoEstudiante
    
    console.log(infoEstudiante)
    return res
      .status(200)
      .json({infoEstudiante});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};