
import express from 'express';
import { loginJefeDepartamento, obtenerDocente , notasIngresadasDocentesDepartamento, 
    obtenerEvaluacionesDocentesDepartamento, obtenerEvaluacion, listadoEstudiantesMatriculado, restablecerContraseña,
    obtenerDocentesDepartamento,
    obtenerAsignaturasDepartamento,
    obtenerEdificios,
    obtenerAulas,
    obtenerHorasDisponibles,
    crearSeccion,
    obtenerEdificiosAuls,
    obtenerSecciones,
    actualizarCuposSeccion,
    cancelacionSeccion,
    obtenerListaEspera,
    obtenerListaEsperaInfo,
    aceptarEstudianteListaEspera
} from '../controllers/jefeDepartamento.controller.js';

const router = express.Router();

router.post("/login", loginJefeDepartamento);
router.post('/obtenerDocente', obtenerDocente)
router.post('/obtenerNotasDocenteClase', notasIngresadasDocentesDepartamento)
router.post('/obtenerEvaluaciones', obtenerEvaluacionesDocentesDepartamento)
router.post('/obtenerEvaluacion', obtenerEvaluacion)
router.post('/listadoEstudiantesMatriculado', listadoEstudiantesMatriculado)
router.post('/restablecerContraseniaDocente', restablecerContraseña)
router.post('/obtenerAsignaturasDepartamento', obtenerAsignaturasDepartamento)
router.post('/obtenerDocentesDepartamento', obtenerDocentesDepartamento)
router.post('/obtenerEdificios', obtenerEdificios)
router.post('/obtenerAulas', obtenerAulas)
router.post('/obtenerHorasDisponibles', obtenerHorasDisponibles)
router.post('/crearSeccion', crearSeccion)
router.post('/obtenerEdificiosAulas', obtenerEdificiosAuls)
router.post('/obtenerSecciones', obtenerSecciones)
router.post('/actualizarCuposSeccion', actualizarCuposSeccion)
router.post('/cancelacionSeccion', cancelacionSeccion)
router.post('/obtenerListaEspera', obtenerListaEspera)
router.post('/obtenerListaEsperaInfo', obtenerListaEsperaInfo)
router.post('/aceptarEstudianteListaEspera', aceptarEstudianteListaEspera)

export default router;