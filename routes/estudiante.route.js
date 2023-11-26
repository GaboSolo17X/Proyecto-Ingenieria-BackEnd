import express from 'express';
import { 
    loginEstudiante,
    getEstudiantes,
    getEstudianteByCuenta,
    actualizarCarreraEstudiante,
    passwordResetMail,
    getInfo,
    getNotasPeriodo,
    guardarEvaluacion,
    contUpload,
    solicitudCambioCarrera, contCambioCarrera,
    solicitudCambioCentro,contCambioCentro,
    solicitudCancelacionClases,uploadPdf,
    solicitudReposicion, contReposicion,
    createMatricula,contCreateMatricula,
    readMatricula,contReadMatricula,
    deleteMatricula,contdeleteMatricula,
    notasDespuesEvaluacion,
    getAsignaturasMatricula,contgetAsignaturasMatricula,
    getSeccionesDisponibles,contgetSeccionesDisponibles,
    getIndiceAcademico,
    getCarreraMatricula,
    getInfoSeccion,
    addListaEspera,
    deleteListaEspera,
    getListaEspera,
    clasesCanceladas,
    getInfoEvaluacion,
    infoCertificado
} from '../controllers/estudiante.controller.js';

const router = express.Router();

router.post("/login", loginEstudiante);
router.get("/getestudiantes", getEstudiantes);
router.get("/getestudiantes/bycuenta", getEstudianteByCuenta);
router.post("/actualizarCarrera",actualizarCarreraEstudiante);
router.post("/recuperacionClave",passwordResetMail);
router.get("/getInfo",getInfo);
router.get("/getNotas",getNotasPeriodo);
router.post("/evalucionDocente",contUpload.array(),guardarEvaluacion);
router.post("/solicitudCambioCarrera",contCambioCarrera.array(),solicitudCambioCarrera);
router.post("/solicitudCambioCentro",contCambioCentro.array(),solicitudCambioCentro);
router.post("/cancelacionExcepcional",uploadPdf,solicitudCancelacionClases);
router.post("/solicitudReposicion",contReposicion.array(),solicitudReposicion);
router.post("/createMatricula",contCreateMatricula.array(),createMatricula);
router.post("/readMatricula",contReadMatricula.array(),readMatricula);
router.post("/deleteMatricula",contdeleteMatricula.array(),deleteMatricula)
router.post("/notasDespuesEvaluacion",notasDespuesEvaluacion);
router.post("/getAsignaturasMatricula",contgetAsignaturasMatricula.array(),getAsignaturasMatricula);
router.post("/getSeccionesDisponibles",contgetSeccionesDisponibles.array(),getSeccionesDisponibles);
router.post("/getIndiceAcademico",getIndiceAcademico);
router.post("/getCarreraMatricula",getCarreraMatricula);
router.post("/getInfoSeccion",getInfoSeccion);
router.post("/addListaEspera",addListaEspera);
router.post("/deleteListaEspera",deleteListaEspera);
router.post("/getListaEspera",getListaEspera);
router.post("/clasesCanceladas",clasesCanceladas);
router.post("/getInfoEvaluacion",getInfoEvaluacion);
router.post("/infoCertificado",infoCertificado);


export default router;