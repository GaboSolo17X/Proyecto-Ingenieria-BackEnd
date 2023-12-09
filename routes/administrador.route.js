import express from 'express';
import { loginAdministrador,hashPassword , actualizarEstadoProceso, ObtenerEstadoProceso} from '../controllers/administrador.controller.js';

const router = express.Router();

router.post("/login", loginAdministrador);
router.post("/hashPassword", hashPassword)
router.post("/actualizarEstadoProceso", actualizarEstadoProceso)
router.get("/ObtenerEstadoProceso", ObtenerEstadoProceso)

export default router;