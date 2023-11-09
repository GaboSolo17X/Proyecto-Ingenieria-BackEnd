import express from 'express';
import { loginEstudiante,getEstudiantes,getEstudianteByCuenta , actualizarCarreraEstudiante,passwordResetMail,getInfoByToken} from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);
router.post("/actualizarCarrera",actualizarCarreraEstudiante);
router.post("/recuperacionClave",passwordResetMail);
router.get("/getInfoByToken",getInfoByToken);


export default router;