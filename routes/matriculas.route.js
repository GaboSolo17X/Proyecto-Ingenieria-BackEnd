import express from 'express';
import { 
    obtenerClasesMatricula,
    subirNota
} from '../controllers/matriculas.controller.js';

const router = express.Router();

router.get("/", obtenerClasesMatricula);
router.post("/subirNota", subirNota);
export default router;