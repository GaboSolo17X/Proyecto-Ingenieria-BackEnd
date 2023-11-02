import express from 'express';
import { crearAspirante } from '../controllers/aspirante.controller.js';



const router = express.Router();

router.post("/sata", crearAspirante);


export default router;