import express from 'express';
import { 
    getContactos,
    getChats,
    createSolicitud,
    getSolicitudes,
    aceptarSolicitud,
    rechazarSolicitud,
    createGrupo,
    getGrupos,
    salirGrupo,
    getEstudiantesCentro
} from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/getContactos', getContactos);
router.post('/getChats', getChats);
router.post('/createSolicitud', createSolicitud);
router.post('/getSolicitudes', getSolicitudes);
router.post('/aceptarSolicitud', aceptarSolicitud);
router.post('/rechazarSolicitud', rechazarSolicitud);
router.post('/createGrupo', createGrupo);
router.post('/getGrupos', getGrupos);
router.post('/salirGrupo', salirGrupo);
router.post('/getEstudiantesCentro', getEstudiantesCentro);

export default router;