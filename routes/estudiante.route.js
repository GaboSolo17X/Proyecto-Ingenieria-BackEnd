import express from 'express';
import { 
    loginEstudiante,
    getEstudiantes,
    getEstudianteByCuenta,
    actualizarCarreraEstudiante,
    passwordResetMail,
    getInfoByToken,
    getNotasPeriodo,
    guardarEvaluacion,
    contUpload,
    solicitudCambioCarrera,
    solicitudCambioCentro,
    cancelacionClases,
    uploadPdf
} from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);
router.post("/actualizarCarrera",actualizarCarreraEstudiante);
router.post("/recuperacionClave",passwordResetMail);
router.get("/getInfoByToken",getInfoByToken);
router.get("/getNotas",getNotasPeriodo);
router.post("/evalucionDocente",contUpload.array('formulario'),guardarEvaluacion);
router.post("/solicitudCambioCarrera",solicitudCambioCarrera);
router.post("/solicitudCambioCentro",solicitudCambioCentro);
router.post("/cancelacionExcepcional",uploadPdf,cancelacionClases);

export default router;