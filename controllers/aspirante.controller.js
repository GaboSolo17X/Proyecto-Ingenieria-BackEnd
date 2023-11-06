import { aspirante } from "../models/aspiranteModel.js"
import multer from 'multer';
import csv from 'csv-parser';
import fs, { readFileSync } from 'fs';

const storageFotoCertificado = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/aspirantes')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

export const upload = multer({ storage: storageFotoCertificado }).single('fotoCertificado')


export const createAspirante = async (req, res) => {
    try {
        const { identidad, nombres, apellidos, carreraPrincipal, carreraSecundaria, correoPersonal, centroRegional, telefono } = req.body;
        const fotoCertificado = req.file.path;
        const pasoCarreraPrincipal = null;

        const newAspirante = new aspirante({
            identidad,
            nombres,
            apellidos,
            carreraPrincipal,
            carreraSecundaria,
            correoPersonal,
            centroRegional,
            telefono,
            fotoCertificado,
            pasoCarreraPrincipal
        });

        const savedAspirante = await newAspirante.save();
        return res.status(200).json({ message: "Aspirante creado", aspirante: savedAspirante});
        
    } catch (error) {
        console.log(error)
        error.message = "Error al crear el aspirante";
        return res.status(500).json({ message: error.message });
    }
}

export const getAspirantes = async (req, res) => {
    try {
        const aspirantes = await aspirante.findAll();
        const aspirantesArquitectura = [];
        const aspirantesMedicina=[];
        const aspirantesIngenieriaSistema=[];

        for (let index = 0; index < aspirantes.length ; index++) {
            if(aspirantes[index].carreraPrincipal === 'Arquitectura'){
                aspirantesArquitectura.push(aspirantes[index]);
            }
            if(aspirantes[index].carreraPrincipal === 'Medicina'){
                aspirantesMedicina.push(aspirantes[index]);
            }
            if(aspirantes[index].carreraPrincipal === 'Ingenieria en Sistemas'){
                aspirantesIngenieriaSistema.push(aspirantes[index]);
            } 
        }

        return res.status(200).json({ message: "Aspirantes obtenidos", aspirantesArquitectura: aspirantesArquitectura, aspirantesMedicina: aspirantesMedicina, aspirantesIngenieriaSistema: aspirantesIngenieriaSistema});


    } catch (error) {
        //error.message = "Error al obtener los aspirantes";
        return res.status(500).json({ message: error });
    }
}

export const getAspirante = async (req, res) => {
    try {
        const aspirantesPrueba = await aspirante.findAll();
        return res.status(200).json({ message: "Aspirantes obtenidos", aspirante: aspirantesPrueba});
        
    } catch (error) {
        console.log(error);
        error.message = "Error al obtener los aspirantes";
        return res.status(500).json({ message: error.message });
    }
} 