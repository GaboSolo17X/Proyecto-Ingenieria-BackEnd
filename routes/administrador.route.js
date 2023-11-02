import express from 'express';
import { loginAdministrador } from '../controllers/administrador.controller.js';

const router = express.Router();

router.post("/login", loginAdministrador);

export default router;