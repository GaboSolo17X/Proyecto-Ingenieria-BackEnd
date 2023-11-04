import  Express  from "express";
import {subir,subirArchivo,hash,creacionEstudiantes} from "../controllers/subidas.controller.js";

const router = Express.Router();

router.post("/subircsv",subir,subirArchivo);
router.post("/creacion",subir,creacionEstudiantes)

//utilidad para Gabo
router.get("/hash",hash)

export default router;