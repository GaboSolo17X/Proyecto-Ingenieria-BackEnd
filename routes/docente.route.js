import express from 'express';
import { 
    loginDocente,
    registerDocente,
    upload,
    getDocenteByNumeroEmpleado,
    getDocentes,
    descargarListadoEstudiantes,
    getSeccionesDocente,
    getEstudiantesSeccion
    
} from '../controllers/docente.controller.js';

const router = express.Router();

router.post("/login", loginDocente);
router.post("/register", upload, registerDocente);
router.get("/getdocentes", getDocentes);
router.get("/docentes/getbynumer0", getDocenteByNumeroEmpleado);
router.post("/listadoEstudiante", descargarListadoEstudiantes);
router.post("/getSeccionesDocente", getSeccionesDocente)
router.post("/getEstudiantesSeccion", getEstudiantesSeccion)


export default router;

