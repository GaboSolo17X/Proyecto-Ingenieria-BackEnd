import express from 'express';
import { loginEstudiante } from '../controllers/estudiante.controller.js';

const router = express.Router();

router.get("/login", loginEstudiante);


export default router;