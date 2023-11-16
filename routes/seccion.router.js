import express from 'express';
import {actualizarVideo, informacionDocente,formulario} from '../controllers/seccion.controller.js';
const router = express.Router();

//actualizar video de la seccion
router.put('/actualizarVideo',formulario.array(),actualizarVideo );
router.post('/informacionDocente', informacionDocente)

export default router;