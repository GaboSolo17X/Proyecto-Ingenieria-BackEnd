import { cordinadorDocente } from "../models/coordinadorModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import { historial } from "../models/historialModel.js";
import { solicitud } from "../models/solicitudesModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { indiceAcademico } from "../models/indiceAcademicoModel.js";
import { docente } from "../models/docenteModel.js";
import { asignatura } from "../models/asignaturaModel.js";
import { matricula } from "../models/matriculaModel.js";
import { seccion } from "../models/seccionModel.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import XLSX from 'xlsx';
// correoPersonal , claveEstudiante

export const loginCoordinador = async (req, res) => {
    
    
    try {
        const { id, clave } = req.body;
        let coordinadorLogin = await cordinadorDocente.findOne({where: {numeroEmpleadoDocente: id}})
        const  hashedPassword = coordinadorLogin.claveCoordinador;
        if (!coordinadorLogin) {
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }
        const respuestaPassword = await comparePassword(clave, hashedPassword);
        if(!respuestaPassword){
            return res.status(400).json({ message: "Credenciales Incorrectas" });
        }

        const { token, expiresIn } = generateJWT(coordinadorLogin.numeroEmpleadoDocente);
        generateRefreshJWT(coordinadorLogin.numeroEmpleadoDocente, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn, coordinador: coordinadorLogin });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};

export const historialAcademicoEstudiante = async (req, res) => {
    const { numeroCuenta } = req.body;
    const historialFound = await historial.findAll({where: {numeroCuenta}});
    if(!historialFound){
        return res.status(400).json({ message: "No se encontraron registros" });
    }
    return res.status(200).json({ message: "Historial encontrado", historial: historialFound });
};

export const solicitudesEstudiantes = async (req, res) => {
    const solicitudesFound = await solicitud.findAll({where: {estado: "Pendiente"}});
    if(!solicitudesFound){
        return res.status(400).json({ message: "No se encontraron registros" });
    }
    return res.status(200).json({ message: "Solicitudes encontradas", solicitudes: solicitudesFound });

};

export const obtenerSolicutudEsduiante = async (req, res) => {
    const { idSolicitud } = req.body;
    const solicitudFound = await solicitud.findOne({where: {idSolicitud}});
    if(!solicitudFound){
        return res.status(400).json({ message: "No se encontraron registros" });
    }
    const { tipoSolicitud, recurso, diccionario, justificacion, estado, idMatricula, numeroCuenta } = solicitudFound;
    const estudianteFound = await estudiante.findOne({where: {numeroCuenta}});
    const { nombres, apellidos, centroRegional, correoPersonal} = estudianteFound;
    const  indiceAcademicoFound = await indiceAcademico.findOne({where: {numeroCuenta}});
    const { indiceGlobal } = indiceAcademicoFound;
    return res.status(200).json({ message: "Solicitud encontrada", solicitud: { tipoSolicitud, recurso, diccionario, justificacion, estado, idMatricula, nombres, apellidos, centroRegional, correoPersonal, indiceGlobal } });
};

export const cargaAcademica = async (req, res) => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const { numeroEmpleadoDocente, tipoArchivo} = req.body;
    let cargaAcademicaArray = [];


    const docenteCoordinadorFound = await docente.findOne({where: {numeroEmpleadoDocente}});
    const { nombreCarrera } = docenteCoordinadorFound;
    
    const asignaturasFound = await asignatura.findAll({where: {nombreCarrera}});
    for (const asignatura of asignaturasFound) {
        const { idAsignatura , nombreClase, codigoAsignatura } = asignatura;
        const seccionesFound = await seccion.findAll({where: {idAsignatura}});
        for (const seccion of seccionesFound) {
            const {numeroEmpleadoDocente, cupos, aula, edificio, idSeccion, horaInicial} = seccion;
            let numeroEmpleadoDocenteClase = numeroEmpleadoDocente;
            let fecha = new Date(horaInicial);
            let horasUTC = fecha.getUTCHours();
            let minutosUTC = fecha.getUTCMinutes();
            let horaFormateadaUTC = `${horasUTC}${minutosUTC < 10 ? '0' : ''}${minutosUTC}`;
            let seccionAsignada =  horaFormateadaUTC
            const docenteFound = await docente.findOne({where: {numeroEmpleadoDocente}});
            const { nombres, apellidos } = docenteFound;
            const estudianteMatriculados = await matricula.count({where: {idSeccion}});  
            let cargaAcademica = { nombreClase, codigoAsignatura, seccionAsignada,  numeroEmpleadoDocenteClase, nombres, apellidos, cupos, aula, edificio, estudianteMatriculados };    
            console.log(cargaAcademica);
            cargaAcademicaArray.push(Object.values(cargaAcademica));    
        }  
    }

    if( tipoArchivo == "pdf" ){
        let body = [
            ["Nombre Clase", "Codigo Asignatura", "ID Seccion",  "Numero Empleado" ,"Nombres Docente", "Apellidos Docente", "Cupos", "Aula", "Edificio", "Estudiantes Matriculados"],
            ...cargaAcademicaArray
        ];
        let docDefinition = {
            content: [
                {
                    table:{
                        body: body
                    }
                }
            ]
        }
        let pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer( (buffer) => {
            res.end(new Buffer(buffer, 'base64'));
        });
        
    }else{
        let body = [
            ["Nombre Clase", "Codigo Asignatura", "Numero Empleado" ,"Nombres Docente", "Apellidos Docente", "Cupos", "Aula", "Edificio", "Estudiantes Matriculados", "ID Seccion"],
            ...cargaAcademicaArray
        ];
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.aoa_to_sheet(body);
        XLSX.utils.book_append_sheet(wb, ws, "Carga Academica");

        let wbout = XLSX.write(wb, {bookType:'xlsx', type:'buffer'});

        res.setHeader('Content-Disposition', 'attachment; filename="cargaAcademica.xlsx"');
        res.type('application/octet-stream');
        res.send(wbout);
        
    }


};