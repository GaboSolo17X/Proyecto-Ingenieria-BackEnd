import express from 'express';
import { createAspirante, upload, getAspirantes, getAspirante} from '../controllers/aspirante.controller.js';
import {bodyRegisterValidator} from '../helpers/validatorManager.js'


const router = express.Router();

router.post("/create", upload , bodyRegisterValidator  , createAspirante);
router.get("/get", getAspirantes);
router.get("/get/prueba", getAspirante)


export default router;

