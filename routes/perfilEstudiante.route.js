import express from 'express';
import {
    perfilEstudianteById,contPerfilEstudianteById,
    modPerfilEstudiante,contModPerfilEstudiante,
    añadirFoto,contAñadirFoto
} from "../controllers/perfilEstudiante.controller.js";

const router = express.Router();

router.post("/perfilEstudianteById",contPerfilEstudianteById.array(),perfilEstudianteById);
router.post("/modPerfilEstudiante",contModPerfilEstudiante.array(),modPerfilEstudiante);
router.post("/añadirFoto",contAñadirFoto,añadirFoto);

export default router;