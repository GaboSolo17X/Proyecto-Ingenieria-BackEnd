import express from 'express';
import { getCarreras} from "../controllers/carreras.controller.js";

const router = express.Router();

router.get("/", getCarreras);


export default router;