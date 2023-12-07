import express from 'express';
import { loginCoordinador , historialAcademicoEstudiante, solicitudesEstudiantes, cargaAcademica,  getAsignaturas, obtenerSolicutudEsduiante, enviarPdf, actualizarSolicitud} from '../controllers/coordinador.controller.js';

const router = express.Router();

router.post("/login", loginCoordinador);
router.post("/historialAcademicoEstudiante", historialAcademicoEstudiante);
router.get("/solicitudes", solicitudesEstudiantes)
router.post("/cargaAcademica", cargaAcademica )
router.post("/getAsignatura", getAsignaturas)
router.post("/obtenerSolicitud", obtenerSolicutudEsduiante);
router.post("/enviarPdf", enviarPdf)
router.post("/actualizarSolicitud", actualizarSolicitud)

export default router;