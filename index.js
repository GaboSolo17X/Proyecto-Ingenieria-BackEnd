import "dotenv/config";
import "./config/confSequelize.js"
import "./database/connectDB.js"
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import subidas from "./routes/subidas.route.js";
import estudianteRouter from "./routes/estudiante.route.js";
import coordinadorRouter from "./routes/coordinador.route.js";
import docenteRouter from "./routes/docente.route.js";
import administradorRouter from "./routes/administrador.route.js";
import jefeDepartamentoRouter from "./routes/jefeDepartamento.route.js";
import carrerasRouter from "./routes/carreras.route.js";
import tokenRouter from "./routes/token.route.js";
import aspiranteRouter from "./routes/aspirante.route.js";


const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2];
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
    cors({
        origin: function (origin, callback) {
            //console.log("😲😲😲 =>", origin);
            if (!origin || whiteList.includes(origin)) {
                return callback(null, origin);
            }
            return callback(
                "Error de CORS origin: " + origin + " No autorizado!"
            );
        },
        credentials: true,
    })
);


app.use(express.json());
app.use(cookieParser());



app.use("/aspirante", aspiranteRouter);
app.use("/estudiante", estudianteRouter);
app.use("/docente", docenteRouter);
app.use("/coordinador", coordinadorRouter);
app.use("/administrador", administradorRouter);
app.use("/jefeDepartamento", jefeDepartamentoRouter);
app.use("/carreras", carrerasRouter);
app.use("/token", tokenRouter);

// Para recibir archivos, procesarlo y enviarl los correos
app.use("/upload", subidas);


app.listen(process.env.PORT, () => console.log(`Servidor Iniciado en el puerto http://localhost:${process.env.PORT}`));