import "dotenv/config";
import "./config/confSequelize.js"
import "./database/connectDB.js"
import express from "express";
import {Server} from "socket.io"
import {createServer} from "node:http"
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
import matriculaRouter from "./routes/matriculas.route.js";
import seccionRouter from "./routes/seccion.router.js";
import perfilEstdudiante from "./routes/perfilEstudiante.route.js";
import chats from "./routes/chat.route.js"
import jwt from "jsonwebtoken";
import url from 'url';
import querystring from 'querystring';
import socket from './helpers/socketManager.js'

import { asignatura } from "./models/asignaturaModel.js";
import { seccion } from "./models/seccionModel.js";
import { matricula } from "./models/matriculaModel.js";
//import { listaEspera } from "./models/listaEsperaModel.js";
import { edificio } from "./models/edificioModel.js";
import { aula } from "./models/aulaModel.js";
// import { historial } from "./models/historialModel.js";
 //import { estado_Proceso } from "./models/estadoProceso.js";
 //import { indiceAcademico } from "./models/indiceAcademicoModel.js";
import { evaluacion } from "./models/evaluacionModel.js";
import { JustificacionCancelacionSeccion } from "./models/justificacionCancelacionSeccionModel.js";
import {matriculaCancelada} from "./models/matriculaCanceladaModel.js"
import {solicitud} from "./models/solicitudesModel.js"
import { fotoEstudiante } from "./models/fotoEstudianteModel.js";
import { perfilEstudiante } from "./models/perfilEstudianteModel.js";
import { chat } from "./models/chatModel.js";
import { grupo } from "./models/grupoModel.js";
import { solicitudChat } from "./models/solicitudChatModel.js"; 

 //
const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2];
const app = express();
const server = createServer(app)
const io = new Server(server, {
    cors: {
      origin: whiteList, // Puedes usar whiteList en lugar de una URL específica
      methods: ["GET", "POST"] // Puedes especificar los métodos permitidos si es necesario
    }
});
socket(io)



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
app.use("/matricula", matriculaRouter);
app.use("/seccion", seccionRouter)
app.use("/perfilEstudiante", perfilEstdudiante);
app.use("/upload", subidas);
app.use("/chat",chats)


app.get("/restablecerContrasenia", (req, res) => {
    const parsedUrl = url.parse(req.url);
    const parsedQs = querystring.parse(parsedUrl.query);
    const token = parsedQs.token;

    //Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            res.send("El token no es válido o ya expiro");
        }
        else{
            const numeroEmpleadoDocente = decoded.numeroEmpleadoDocente;
            res.redirect('http://localhost:8080/#/reiniciarClave/' + numeroEmpleadoDocente);
        }
    });
 
  });


app.get('/descargar/:rutaArchivo', (req, res) => {
    const rutaArchivo = path.join(__dirname, req.params.rutaArchivo);
    res.sendFile(rutaArchivo);
})

server.listen(process.env.PORT, () => console.log(`Servidor Iniciado en el puerto http://localhost:${process.env.PORT}`));



