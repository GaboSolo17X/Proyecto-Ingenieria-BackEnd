import express from 'express';
import { crearAspirante } from '../controllers/aspirante.controller.js';



const router = express.Router();

router.get("/sata", crearAspirante);


export default router;