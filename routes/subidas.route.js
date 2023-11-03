import  Express  from "express";
import {subir,subirArchivo,fecha} from "../controllers/subidas.controller.js";

const router = Express.Router();

router.post("/subircsv",subir,subirArchivo);
router.get("/fecha",fecha)

export default router;