import express from 'express';
import { loginAdministrador,hashPassword } from '../controllers/administrador.controller.js';

const router = express.Router();

router.post("/login", loginAdministrador);
router.post("/hashPassword", hashPassword)

export default router;