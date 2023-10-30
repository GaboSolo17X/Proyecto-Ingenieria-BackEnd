import "dotenv/config";
import "./config/confSequelize.js"
import "./database/connectDB.js"
import  express from "express";
import cookieParser from "cookie-parser";
import { carrera } from "./models/carreraModel.js";
import { docente } from "./models/docenteModel.js";
import { cordinadorDocente } from "./models/coordinadorModel.js";
import { jefeDepartamento } from "./models/jefeDepartamentoModel.js";




const app = express();
app.use(express.json());
app.use(cookieParser());



app.listen(process.env.PORT, () => console.log("Servidor Iniciado"));