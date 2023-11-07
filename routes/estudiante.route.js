import express from 'express';
import { loginEstudiante,getEstudiantes,getEstudianteByCuenta , cambiarClaveEstudiante} from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);
//router.post("/cambiarclave",cambiarClaveEstudiante)
router.post("/actualizarCarrera",actualizarCarreraEstudiante)

export default router;