import express from 'express';
import {
    perfilEstudianteById,contPerfilEstudianteById,
    modPerfilEstudiante,contModPerfilEstudiante,
    añadirFoto,contAñadirFoto,
    eliminarFoto,contEliminarFoto,
    getFotosEstudianes,contGetFotosEstudianes,actualizarLocalStorage
} from "../controllers/perfilEstudiante.controller.js";

const router = express.Router();

router.post("/perfilEstudianteById",contPerfilEstudianteById.array(),perfilEstudianteById);
router.post("/modPerfilEstudiante",contModPerfilEstudiante.array(),modPerfilEstudiante);
router.post("/addFoto",contAñadirFoto,añadirFoto);
router.post("/deleteFoto",contEliminarFoto.array(),eliminarFoto);
router.post("/getFotosEstudianes",contGetFotosEstudianes.array(),getFotosEstudianes);
router.post("/actualizarLocalStorage",actualizarLocalStorage);

export default router;