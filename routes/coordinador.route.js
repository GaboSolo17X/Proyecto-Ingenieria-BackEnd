import express from 'express';
import { loginCoordinador , historialAcademicoEstudiante, solicitudesEstudiantes, cargaAcademica} from '../controllers/coordinador.controller.js';

const router = express.Router();

router.post("/login", loginCoordinador);
router.post("/historialAcademicoEstudiante", historialAcademicoEstudiante);
router.get("/solicitudes", solicitudesEstudiantes)
router.post("/cargaAcademica", cargaAcademica )

export default router;