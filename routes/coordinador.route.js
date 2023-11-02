import express from 'express';
import { loginCoordinador } from '../controllers/coordinador.controller.js';

const router = express.Router();

router.post("/login", loginCoordinador);


export default router;