
import express from 'express';
import { loginJefeDepartamento } from '../controllers/jefeDepartamento.controller.js';

const router = express.Router();

router.post("/login", loginJefeDepartamento);

export default router;