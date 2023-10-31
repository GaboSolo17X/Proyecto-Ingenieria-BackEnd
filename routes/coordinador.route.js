import express from 'express';
import { loginCoordinador } from '../controllers/coordinador.controller.js';

const router = express.Router();

router.get("/login", loginCoordinador);


export default router;