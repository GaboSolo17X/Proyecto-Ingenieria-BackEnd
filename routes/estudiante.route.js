import express from 'express';
import { loginEstudiante,getEstudiantes,getEstudianteByCuenta } from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);


export default router;