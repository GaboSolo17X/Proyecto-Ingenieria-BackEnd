import express from 'express';
import { loginDocente,registerDocente,upload,getDocenteByNumeroEmpleado,getDocentes } from '../controllers/docente.controller.js';

const router = express.Router();

router.post("/login", loginDocente);
router.post("/register", upload, registerDocente);
router.get("/getdocentes", getDocentes);
router.get("/docentes/getbynumer0", getDocenteByNumeroEmpleado);


export default router;

