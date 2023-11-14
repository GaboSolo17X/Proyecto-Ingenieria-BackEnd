import express from 'express';
import { obtenerClasesMatricula} from '../controllers/matriculas.controller.js';

const router = express.Router();

router.get("/", obtenerClasesMatricula);

export default router;