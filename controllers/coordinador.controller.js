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
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
        const docenteFind = await docente.findOne({where: { numeroEmpleadoDocente: id}})

        const { token, expiresIn } = generateJWT(coordinadorLogin.numeroEmpleadoDocente);
        generateRefreshJWT(coordinadorLogin.numeroEmpleadoDocente, res);

        return res.status(200).json({ message: "Login exitoso", token, expiresIn, coordinador: coordinadorLogin, docente: docenteFind });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor" });
        
    }
};

export const historialAcademicoEstudiante = async (req, res) => {
    const { numeroCuenta } = req.body;
    const estudianteFound = await estudiante.findOne({where: {numeroCuenta}})
    console.log(estudianteFound)
    if(!estudianteFound){
        return res.status(400).json({ message: "No se encontraron registros" , codigoError : 1 });
    }else{
        const historialFound = await historial.findAll({where: {numeroCuenta}});
        if (historialFound.length === 0) {
            return res.status(400).json({ message: "No se encontraron registros en el historial académico para este estudiante" , codigoError : 2});
        }
        const indiceAcademicoFound = await indiceAcademico.findOne({where: {numeroCuenta}})
        const {indiceGlobal} = indiceAcademicoFound
        return res.status(200).json({ message: "Historial encontrado", historial: historialFound , estudiante: estudianteFound, indice: indiceGlobal});
    }
    
};

export const solicitudesEstudiantes = async (req, res) => {
    const solicitudesFound = await solicitud.findAll({where: {estado: "Pendiente"}});
    let estudianteSolicitud = []
    if(!solicitudesFound){
        return res.status(400).json({ message: "No se encontraron registros" });
    }
    for (const solicitud of solicitudesFound) {
        const estudianteFound = await estudiante.findOne({where: { numeroCuenta: solicitud.dataValues.numeroCuenta}})
        const {nombres, apellidos, correoPersonal} = estudianteFound
        estudianteSolicitud.push({
            nombreCompleto: nombres + " " + apellidos,
            correo: correoPersonal
        })
    }
   
    
    return res.status(200).json({ message: "Solicitudes encontradas", solicitudes: solicitudesFound, estudiante: estudianteSolicitud  });

};

export const obtenerSolicutudEsduiante = async (req, res) => {
    const { idSolicitud } = req.body;
    const solicitudFound = await solicitud.findOne({where: {idSolicitud}});
    if(!solicitudFound){
        return res.status(400).json({ message: "No se encontraron registros" });
    }
    const { tipoSolicitud, recurso, diccionario, justificacion, estado, idMatricula, numeroCuenta } = solicitudFound;
    const estudianteFound = await estudiante.findOne({where: {numeroCuenta}});
    const { nombres, apellidos, centroRegional, correoPersonal, carrera} = estudianteFound;
    const  indiceAcademicoFound = await indiceAcademico.findOne({where: {numeroCuenta}});
    const { indiceGlobal } = indiceAcademicoFound;
    return res.status(200).json({ message: "Solicitud encontrada", solicitud: { tipoSolicitud, recurso, diccionario, justificacion, estado, idMatricula, nombres, apellidos, centroRegional, correoPersonal, indiceGlobal, carrera } });
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
        let columnWidths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

        let docDefinition = {
            content: [
                {
                    table:{
                        widths: columnWidths,
                        body: body,
                    }
                }
            ],
            pageOrientation: 'landscape'
        }
        let pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer( (buffer) => {
            res.end(new Buffer(buffer, 'base64'));
        });
        
    }else{
        let body = [
            ["Nombre Clase", "Codigo Asignatura", "ID Seccion",  "Numero Empleado" ,"Nombres Docente", "Apellidos Docente", "Cupos", "Aula", "Edificio", "Estudiantes Matriculados"],
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

export const getAsignaturas = async (req, res) => {
    const {idAsignatura} = req.body;
    const asignaturasFound = await asignatura.findOne({where: {idAsignatura}})
    return res.status(200).json({asignatura: asignaturasFound})
}

export const enviarPdf = async (req, res) => {
    const {rutaPdf} = req.body
    let ruta = 'http://localhost:3000/' + rutaPdf
    return res.status(200).send({ruta})
};  

export const actualizarSolicitud = async(req, res) =>{
    const {idSolicitud, estado} = req.body
    const solicitudFound = await solicitud.findOne({where:{idSolicitud}})
    let {numeroCuenta, tipoSolicitud, diccionario} = solicitudFound.dataValues
    if( tipoSolicitud == 'Cancelacion Excepcional'){
        let clases = JSON.stringify(diccionario).split(",").map((item) => item.trim());
        for (let index = 0; index < clases.length; index++) {
            let resultado = clases[index].match(/([A-Z]+-\d+)/)
            const asignaturaFound = await asignatura.findOne({where:{codigoAsignatura: resultado}})
            const {idAsignatura} =  asignaturaFound.dataValues
            const seccionFound = await seccion.findOne({where:{ idAsignatura }})
            const {idSeccion} = seccionFound.dataValues
            const matriculasFound = await matricula.findOne({where: {idSeccion}})
            const {idMatricula,numeroCuenta, periodo} = matriculasFound.dataValues
            let date = new Date().getFullYear()
            console.log(date)
            let newHistorial = {
                numeroCuenta : numeroCuenta,
                idAsignatura : idAsignatura,
                calificacion : null,
                estado: "ABN",
                periodo: date + "-" + periodo,
            }
            const historialCreate = await historial.create(newHistorial)
            const deleteMatricula = await matricula.destroy({where:{idMatricula}})
            console.log(deleteMatricula)

        }
    }else if ( tipoSolicitud == 'Cambio de Centro'){
        const estudianteFound = await estudiante.update({centroRegional:diccionario}, {where:{numeroCuenta}})
    }else{
        const estudianteFound = await estudiante.update({carrera:diccionario}, {where:{numeroCuenta}})
    }
    const updateSolicitudFound = await solicitud.update({estado: estado}, {where: {idSolicitud}});
    return res.status(200).json({ message: "Solicitud actualizada" });
}