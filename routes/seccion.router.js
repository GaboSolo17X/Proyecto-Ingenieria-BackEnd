import express from 'express';
import {actualizarVideo, informacionDocente} from '../controllers/seccion.controller.js';
const router = express.Router();

//actualizar video de la seccion
router.put('/actualizarVideo', actualizarVideo );
router.post('/informacionDocente', informacionDocente)

export default router;