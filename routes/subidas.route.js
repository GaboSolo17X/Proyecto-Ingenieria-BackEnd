import  Express  from "express";
import {subir,subirArchivo,creacionEstudiantes, enviarCSV} from "../controllers/subidas.controller.js";


const router = Express.Router();


router.post("/subircsv",subir, subirArchivo);
router.post("/creacion",subir,creacionEstudiantes)
router.post("/descargarcsv", enviarCSV);




export default router;