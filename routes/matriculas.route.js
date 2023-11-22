import express from 'express';
import { 
    obtenerClasesMatricula,
    subirNota,
    obtenerNotasSeccion
} from '../controllers/matriculas.controller.js';

const router = express.Router();

router.get("/", obtenerClasesMatricula);
router.post("/subirNota", subirNota);
router.post("/obtenerNotasSeccion", obtenerNotasSeccion);
export default router;