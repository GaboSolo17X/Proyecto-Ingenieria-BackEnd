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
    solicitudCambioCarrera, contCambioCarrera,
    solicitudCambioCentro,contCambioCentro,
    solicitudCancelacionClases,uploadPdf,
    solicitudReposicion, contReposicion,
    clasesMatricula,
    createMatricula,
    readMatricula,
    deleteMatricula
} from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);
router.post("/actualizarCarrera",actualizarCarreraEstudiante);
router.post("/recuperacionClave",passwordResetMail);
router.get("/getInfoByToken",getInfoByToken);
router.get("/getNotas",getNotasPeriodo);
router.post("/evalucionDocente",contUpload.array(),guardarEvaluacion);
router.post("/solicitudCambioCarrera",contCambioCarrera.array(),solicitudCambioCarrera);
router.post("/solicitudCambioCentro",contCambioCentro.array(),solicitudCambioCentro);
router.post("/cancelacionExcepcional",uploadPdf,solicitudCancelacionClases);
router.post("/solicitudReposicion",contReposicion.array(),solicitudReposicion);
router.get("/clasesMatricula",clasesMatricula);
router.post("/createMatricula",createMatricula);
router.get("/readMatricula",readMatricula);
router.post("/deleteMatricula",deleteMatricula)

export default router;