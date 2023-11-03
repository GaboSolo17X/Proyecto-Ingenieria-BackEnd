import  Express  from "express";
import {subir,subirArchivo} from "../controllers/subidas.controller.js";

const router = Express.Router();

router.post("/subircsv",subir,subirArchivo);

export default router;