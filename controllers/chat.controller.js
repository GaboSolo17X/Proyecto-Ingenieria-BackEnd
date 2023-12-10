import { chat } from "../models/chatModel.js";
import { grupo } from "../models/grupoModel.js";
import { solicitudChat } from "../models/solicitudChatModel.js";
import { estudiante } from "../models/estudianteModel.js";
import { perfilEstudiante } from "../models/perfilEstudianteModel.js";
import { fotoEstudiante } from "../models/fotoEstudianteModel.js";
import { forEach, isEmpty, isNull,isUndefined } from "underscore";
import mailer from "../config/confMailer.js";
import multer from "multer";

//nombre, numero cuenta, foto
export const getContactos = async (req, res) => {
    try {
        //0.numero de cuenta
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });

        //console.log(respuesta);

        const contactos = await chat.findAll({where: {idUsuario: respuesta[0]}});
        const contactos2 = await chat.findAll({where: {idUsuario2: respuesta[0]}});

        //unir los usuarios de los contactos
        if(isNull(contactos) && isNull(contactos2)){
            res.status(400).json({ message: "No tiene contactos" });
        }

        const usuarios = [];
        if(!isNull(contactos)){
            contactos.forEach((contacto) => {
                usuarios.push(contacto.dataValues);
            });

        }
        if(!isNull(contactos2)){
            contactos2.forEach((contacto) => {
                usuarios.push(contacto.dataValues);
            });
        }

        //obtener nombre, numeroCuenta y foto de los usuarios
        for(let usuario of usuarios){
            
            if(usuario.idUsuario !== respuesta[0]){
                const estudiante1 = await estudiante.findOne({where: {numeroCuenta: usuario.idUsuario}});
                const perfilEstudiante1 = await perfilEstudiante.findOne({where: {numeroCuenta: usuario.idUsuario}});
                const fotoEstudiante1 = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante1.idfotoEstudiante}});
                
                if(!isNull(estudiante1) && !isNull(perfilEstudiante1) && !isNull(fotoEstudiante1)){
                    usuario.nombre = estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0];
                    usuario.numeroCuenta = estudiante1.numeroCuenta;
                    usuario.foto = fotoEstudiante1.dataValues.fotoEstudiante;
                }
            }

            if(usuario.idUsuario2 !== respuesta[0]){
                const estudiante2 = await estudiante.findOne({where: {numeroCuenta: usuario.idUsuario2}});
                const perfilEstudiante2 = await perfilEstudiante.findOne({where: {numeroCuenta: usuario.idUsuario2}});
                const fotoEstudiante2 = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante2.idfotoEstudiante}});

                if(!isNull(estudiante2) && !isNull(perfilEstudiante2) && !isNull(fotoEstudiante2)){
                    usuario.nombre = estudiante2.dataValues.nombres.split(" ")[0]+" "+estudiante2.dataValues.apellidos.split(" ")[0];
                    usuario.numeroCuenta = estudiante2.numeroCuenta;
                    usuario.foto = fotoEstudiante2.dataValues.fotoEstudiante;
                }
            }
        };

        return res.status(200).json({ contactos: usuarios });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

export const getChats = async (req, res) => {
    try {
        //0.numero de cuenta
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });

        //console.log(respuesta);

        const chats1 = await chat.findAll({where: {idUsuario: respuesta[0]}});
        const chats2 = await chat.findAll({where: {idUsuario2: respuesta[0]}});

        //unir los usuarios de los contactos
        const usuarios = [];

        //verificaciones 
        if(chats1.length == 0 && chats2.length == 0){
            return res.status(200).json({ chats: [] });
        }

        
        chats1.forEach((contacto) => {
            usuarios.push(contacto.dataValues);
        });
        chats2.forEach((contacto) => {
            usuarios.push(contacto.dataValues);
        });

        const chats = [];
        usuarios.forEach((chat) => {
            if(chat.estado == true){
                chats.push(chat);
            }
        });
        
        for(let usuario of chats){
            
            if(usuario.idUsuario !== respuesta[0]){
                const estudiante1 = await estudiante.findOne({where: {numeroCuenta: usuario.idUsuario}});
                const perfilEstudiante1 = await perfilEstudiante.findOne({where: {numeroCuenta: usuario.idUsuario}});
                const fotoEstudiante1 = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante1.dataValues.idfotoEstudiante}});
                
                if(!isNull(estudiante1) && !isNull(perfilEstudiante1) && !isNull(fotoEstudiante1)){
                    usuario.nombre = estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0];
                    usuario.numeroCuenta = estudiante1.dataValues.numeroCuenta;
                    usuario.foto = fotoEstudiante1.dataValues.fotoEstudiante;
                }
            }

            if(usuario.idUsuario2 !== respuesta[0]){
                const estudiante2 = await estudiante.findOne({where: {numeroCuenta: usuario.idUsuario2}});
                const perfilEstudiante2 = await perfilEstudiante.findOne({where: {numeroCuenta: usuario.idUsuario2}});
                const fotoEstudiante2 = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante2.dataValues.idfotoEstudiante}});

                if(!isNull(estudiante2) && !isNull(perfilEstudiante2) && !isNull(fotoEstudiante2)){
                    usuario.nombre = estudiante2.dataValues.nombres.split(" ")[0]+" "+estudiante2.dataValues.apellidos.split(" ")[0];
                    usuario.numeroCuenta = estudiante2.dataValues.numeroCuenta;
                    usuario.foto = fotoEstudiante2.dataValues.fotoEstudiante;
                }
            }
        };

        return res.status(200).json({ chats: chats });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const createSolicitud = async (req, res) => {
    try {
        //0.numero de cuenta de orign 1.numero de cuenta de destino
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });

        console.log(respuesta);

        const solicitud = await solicitudChat.create(
            {
                idUsuario: respuesta[0],
                idUsuario2: respuesta[1],
                estado: "Pendiente"
            }
        );
        
        solicitud.save();

        const estudianteEmisor = await estudiante.findOne({where:{numeroCuenta: respuesta[0]}})
        const estudianteRemitente = await estudiante.findOne({where:{numeroCuenta: respuesta[1]}})

        const mailOptions = {
            from: "Registro" + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
            to: estudianteRemitente.dataValues.correoPersonal,
            subject: "Notificacion de solicitud",
            Text: "Tiene una solicitud",
            html: 
            `<h1>Tienes una nueva solicitud de amistad</h1>
            
            <h2>La solicitud es de ${estudianteEmisor.dataValues.nombres} ${estudianteEmisor.dataValues.apellidos} con número  de cuenta ${estudianteEmisor.dataValues.numeroCuenta}</h2>`
            ,
          };
          await mailer.sendMail(mailOptions);


        return res.status(200).json({ message: "Solicitud enviada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const getSolicitudes = async (req, res) => {
    try {
        //0.numero de cuenta
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });

        //console.log(respuesta);

        const solicitudes = await solicitudChat.findAll({where: {idUsuario2: respuesta[0], estado: "Pendiente"}});

        //obtener la info del usuario que envio la solicitud
        if(isNull(solicitudes)){
            return res.status(400).json({ message: "el usuario no tiene solicitudes" });
        }

        const usuarios = [];
        solicitudes.forEach((contacto) => {
            usuarios.push(contacto.dataValues);
        });

        for(let registro of usuarios){
            
            const infoEstudianteEmisor = await estudiante.findOne({where: {numeroCuenta: registro.idUsuario}});
            const perfilEstudianteEmisor = await perfilEstudiante.findOne({where: {numeroCuenta: registro.idUsuario}});
            const fotoEstudianteEmisro = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudianteEmisor.dataValues.idfotoEstudiante}});

            registro.nombre = infoEstudianteEmisor.dataValues.nombres.split(" ")[0]+" "+infoEstudianteEmisor.dataValues.apellidos.split(" ")[0];
            registro.foto = fotoEstudianteEmisro.dataValues.fotoEstudiante;
        }

        //unir los usuarios de los contactos

        return res.status(200).json({ solicitudes: usuarios });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const aceptarSolicitud = async (req, res) => {
    try {
        //0.idSolicitud 1.respuesta 2.idUsuario 3.idUsuario2
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta);

        const solicitud = await solicitudChat.findOne({where: {idSolicitud: respuesta[0]}});
        solicitud.update({
            idUsuario: respuesta[2],
            idUsuario2: respuesta[3],
            estado: respuesta[1]
        });

        solicitud.save()
        

        const chat1 = await chat.create(
            {
                idUsuario: respuesta[2],
                idUsuario2: respuesta[3],
                contenido: ".",
                estado: false
            }
        );

        chat1.save()

        
        return res.status(200).json({ message: "Solicitud aceptada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const rechazarSolicitud = async (req, res) => {
    try {
        //0.idSolicitud 1.respuesta 2.idUsuario 3.idUsuario2
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta);

        const solicitud = await solicitudChat.findOne({where: {idSolicitud: respuesta[0]}});
        solicitud.estado = respuesta[1];
        solicitud.destroy();

        return res.status(200).json({ message: "Solicitud rechazada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const createGrupo = async (req, res) => {
    try {
        //0.usuarios (array) 1.nombreGrupo
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta[0]._value);

        if(respuesta[0]._value.length == 0){
            return res.status(400).json({ message: "el grupo no puede tener solo un integrante" });
        }
        let integrantes = ""
        for(let numeroEstudiante of respuesta[0]._value){
            if(integrantes.length == 0){
                integrantes = numeroEstudiante
            }else{
                integrantes = integrantes.concat(","+numeroEstudiante)
            }
        }  
        console.log(integrantes)
        const grupo1 = await grupo.create(
            {
                participantes: integrantes,
                contenido: ".",
                nombreGrupo : respuesta[1]._value,
                fotoGrupo: `public/images/grupos/${Math.floor(Math.random() * 10) + 1}.jpg`

            }
        );

        grupo1.save()

        return res.status(200).json({ message: "Grupo creado" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const getGrupos = async (req, res) => {
    try {
        //0.idUsuario
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
       // console.log(respuesta);
        const grupos = await grupo.findAll();
        //buscar los grupos del usuario
        const gruposUsuario = [];
        grupos.forEach((grupo) => {
            const participantes = grupo.dataValues.participantes.split(",");
            participantes.forEach((participante) => {
                if(participante == respuesta[0]){
                    gruposUsuario.push(grupo.dataValues);
                }
            });
        });


        //obtener nombre, numeroCuenta y foto de los usuarios de los grupos

        gruposUsuario.forEach(async (grupo) => {

            //console.log(grupo)

            const participantes = grupo["participantes"].split(",");
            const participantes2 = [];
            participantes.forEach(async (participante) => {
                const estudiante1 = await estudiante.findOne({where: {numeroCuenta: participante}});

                /* const perfilEstudiante1 = await perfilEstudiante.findOne({where: {numeroCuenta: participante}});
                const fotoEstudiante1 = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante1.dataValues.idfotoEstudiante}}); */
                
                if(!isNull(estudiante1)){
                    participantes2.push({
                        nombre: estudiante1.nombre,
                        numeroCuenta: estudiante1.numeroCuenta,
                    });
                }
            });
            grupo.participantes = participantes2;
        });

        return res.status(200).json({ grupos: gruposUsuario });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const salirGrupo = async (req, res) => {
    try {
        //0.idGrupo 1.idUsuario
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta);

        const grupo1 = await grupo.findOne({where: {idGrupo: respuesta[0]}});

        const participantes = grupo1.dataValues.participantes.split(",");
        let participantes2 = [];
        participantes.forEach((participante) => {
            if(participante != respuesta[1]){
                participantes2.push(participante);
            }
        });

        if(participantes2.length <= 0){
            grupo1.destroy()
            return res.status(200).json({ message: "Salio del grupo y se eilimino porque no quedan integrantes" });
        }
        grupo1.update({
            participantes: participantes2.toString()
        })
        grupo1.save();

        return res.status(200).json({ message: "Salio del grupo" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const getEstudiantesCentro = async (req, res) =>{
    try{
        //0. centro regional 1.numero Cuenta estudiante
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta);

        const estudiantesCentro = await estudiante.findAll({where: {centroRegional: respuesta[0]}});

        if(isNull(estudiantesCentro)){
            return res.status(200).json({ message: "No hay estudiantes en este centro" });    
        }

        let estudiantesInfo = []


        for(let estudiante of estudiantesCentro) {
            //verificar si el estudiante ya se encuentra en los chats 
            

            const chats1 = await chat.findAll({where: {idUsuario: estudiante.dataValues.numeroCuenta, idUsuario2: respuesta[0]}});
            const chats2 = await chat.findAll({where: {idUsuario: respuesta[0], idUsuario2: estudiante.dataValues.numeroCuenta}});

            if(isNull(chats1) && isNull(chats2)){
                continue
            }

            const perfilEstudiante1 = await perfilEstudiante.findOne({where: {numeroCuenta: estudiante.dataValues.numeroCuenta}});
            const fotoActual = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudiante1.dataValues.idfotoEstudiante}});


            if(estudiante.dataValues.numeroCuenta != respuesta[1]){
                let contactadoDato = true
                const contactoSolicitud = await solicitudChat.findOne({where: {idUsuario:respuesta[1], idUsuario2:estudiante.dataValues.numeroCuenta}});
                if(isNull(contactoSolicitud)){
                    contactadoDato = false
                }

                const informacion = {   
                    "numeroCuenta": estudiante.dataValues.numeroCuenta,
                    "nombre": estudiante.dataValues.nombres.split(" ")[0]+" "+estudiante.dataValues.apellidos.split(" ")[0],
                    "fotoPerfil": fotoActual.dataValues.fotoEstudiante,
                    "contactado": contactadoDato
                }
                
                estudiantesInfo.push(informacion)
            }
        };
        //console.log(estudiantesInfo)
        return res.status(200).json({ estudiantesInfo });
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
}

//añadir al route

export const getMiembrosGrupo = async (req,res) =>{
    try {
        //0.idGrupo
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        //console.log(respuesta);

        const grupoContenido = await grupo.findOne({where:{idGrupo:respuesta[0]}})

        if(isNull(grupoContenido)){
            return res.status(200).json({ message: "No existe este grupo" });    
        }
        const integrantesGrupo = grupoContenido.dataValues.participantes.split(",")
        //console.log(integrantesGrupo)

        const perfilesIntegrantes = []
        for(let integrante of integrantesGrupo){
            //console.log(integrante)
            const estudiantesInfo = await estudiante.findOne({where: {numeroCuenta: integrante}});
            const perfilEstudianteInfo = await perfilEstudiante.findOne({where: {numeroCuenta: integrante}});
            //console.log(perfilEstudianteInfo)
            const fotoEstudianteInfo = await fotoEstudiante.findOne({where: {idfotoEstudiante: perfilEstudianteInfo.dataValues.idfotoEstudiante}});
            if(isNull(estudiantesInfo) || isNull(perfilEstudianteInfo) || isNull(fotoEstudianteInfo)){

                //console.log(isNull(estudiantesInfo),isNull(perfilEstudianteInfo),isNull(fotoEstudianteInfo))
                return res.status(200).json({ message: "Hay un problema con los miembros del grupo" });    

            }

            perfilesIntegrantes.push(
                {   
                    "nombre": estudiantesInfo.dataValues.nombres.split(" ")[0]+" "+estudiantesInfo.dataValues.apellidos.split(" ")[0],
                    "foto": fotoEstudianteInfo.dataValues.fotoEstudiante,
                    "numeroCuenta": estudiantesInfo.dataValues.numeroCuenta,
                }
            )

            }
        //console.log(perfilesIntegrantes)
        return res.status(200).json({ perfilesGrupo:perfilesIntegrantes });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const eliminarContacto = async (req,res) =>{
    try {
        //0.numeroCuenta_propio 1.numeroCuenta_otro
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
       // console.log(respuesta);

        //Buscar el contacto(chat)

        const contactoChat0 = await chat.findOne({where:{idUsuario: respuesta[0], idUsuario2: respuesta[1]}})
        const contactoChat1 = await chat.findOne({where:{idUsuario: respuesta[1], idUsuario2: respuesta[0]}})

        if(isNull(contactoChat0) && isNull(contactoChat1)){
            return res.status(400).json({ message: "No existe el Chat" });    
        }

        //se encontro en contactoChat0
        if(isNull(contactoChat0) == false && isNull(contactoChat1) == true){
            contactoChat0.destroy()
            const solicitud0 = await solicitudChat.findOne({where:{idUsuario: respuesta[0], idUsuario2: respuesta[1]}})
            const solicitud1 = await solicitudChat.findOne({where:{idUsuario: respuesta[1], idUsuario2: respuesta[0]}})

            if(isNull(solicitud0) && isNull(solicitud1)){
                return res.status(400).json({ message: "No existe la Solicitud lo cual es raro" });    
            }
            
            if(isNull(solicitud0) == false && isNull(solicitud1) == true){
                solicitud0.destroy()
            }
            if(isNull(solicitud0) == true && isNull(solicitud1) == false){
                solicitud1.destroy()
            }

            return res.status(200).json({ message: "Se elimino el contacto" });
        }

        //se encontro en contactoChat1
        if(isNull(contactoChat0) == true && isNull(contactoChat1) == false){
            contactoChat1.destroy()
            
            
            const solicitud0 = await solicitudChat.findOne({where:{idUsuario: respuesta[0], idUsuario2: respuesta[1]}})
            const solicitud1 = await solicitudChat.findOne({where:{idUsuario: respuesta[1], idUsuario2: respuesta[0]}})
            
            if(isNull(solicitud0) && isNull(solicitud1)){
                return res.status(400).json({ message: "No existe la Solicitud lo cual es raro" });    
            }
            
            if(isNull(solicitud0) == false && isNull(solicitud1) == true){
                solicitud0.destroy()
            }
            if(isNull(solicitud0) == true && isNull(solicitud1) == false){
                solicitud1.destroy()
            }
            
            return res.status(200).json({ message: "Se elimino el contacto" });
        }

        return res.status(200).json({ message: "algo extraño paso porque no se hizo nada" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }
}


export const getMensajes = async (req,res) =>{
    try {
        //0.idChat 1.numeroCuenta
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        console.log(respuesta);
        const archivoFiles = ["pdf","xlsx","docx","txt","pptx","mp4"]
        const archivosImagenes = ["jpg","png","jpeg","gif","svg"]

        const chatContenido = await chat.findOne({where:{idChat:respuesta[0]}})

        if(isNull(chatContenido)){
            return res.status(200).json({ message: "No existe este chat" });    
        }

        if(chatContenido.dataValues.contenido == "."){
            return res.status(200).json({ mensajes: [] });    
        }

        let contenidoChat = chatContenido.dataValues.contenido.split("\n")

        let mensajes = []
        for(let mensaje of contenidoChat){
            if(mensaje == "."){
                continue
            }
            if(mensaje.split(":")[0] == respuesta[1]){
                if(archivoFiles.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":false,
                        "sender":true,
                        "archivo":true,
                        "tipo":mensaje.split(".")[mensaje.split(".").length-1],
                        "nombre": mensaje.split(":")[1].split("/")[mensaje.split(":")[1].split("/").length-1].split("-")[1]
                    })
                    continue
                }
                

                if(archivosImagenes.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":false,
                        "sender":true,
                        "archivo":true,
                        "tipo":"imagen"
                    })
                    continue
                }
                mensajes.push({
                    "mensaje": mensaje.split(":")[1],
                    "reciver":false,
                    "sender":true,
                    "archivo":false,
                    "tipo":""
                })
            }else{

                if(archivoFiles.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":true,
                        "tipo":mensaje.split(".")[mensaje.split(".").length-1],
                        "nombre": mensaje.split(":")[1].split("/")[mensaje.split(":")[1].split("/").length-1].split("-")[1]
                    })
                    continue
                }
                if(archivosImagenes.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":true,
                        "tipo":"imagen"
                    })
                    continue
                }
                mensajes.push({
                        "mensaje": mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":false,
                        "tipo":""
                    })
                }
        }
        //console.log(mensajes)
        return res.status(200).json({ mensajes });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/chatFiles/");//gabi dame permisos
    },
    filename: (req, file, cb) => {
      req.body.nameFile = Date.now() + "-" + file.originalname;
      cb(null, req.body.nameFile);
    },
  });
  
const upload = multer({ storage: storage });
  
export const contEnvioArchivos = upload.single("archivo");

export const envioArchivos = async (req,res) =>{
    try {
        //0.idGrupo 1.numeroCuenta 
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        console.log(respuesta);

        const chatContenido = await chat.findOne({where:{idChat:respuesta[0]}})

        if(isNull(chatContenido)){
            return res.status(200).json({ message: "No existe este chat" });    
        }

        chatContenido.update({
            contenido: chatContenido.dataValues.contenido.concat("\n"+`${respuesta[1]}:${req.file.filename}`)
        })
        chatContenido.save()
        return res.status(200).json({ message: "Se envio el archivo" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }

}

export const getMensajesGrupo = async (req,res) =>{
    try {
        //0.idGrupo 1.numeroCuenta
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        console.log(respuesta);
        const archivoFiles = ["pdf","xlsx","docx","txt","pptx","mp4"]
        const archivosImagenes = ["jpg","png","jpeg","gif","svg"]

        const chatContenido = await grupo.findOne({where:{idGrupo:respuesta[0]}})

        if(isNull(chatContenido)){
            return res.status(200).json({ message: "No existe este grupo" });    
        }

        if(chatContenido.dataValues.contenido == "."){
            return res.status(200).json({ mensajes: [] });    
        }

        let contenidoChat = chatContenido.dataValues.contenido.split("\n")

        let mensajes = []
        for(let mensaje of contenidoChat){
            if(mensaje == "."){
                continue
            }
            const estudiante1 = await estudiante.findOne({where: {numeroCuenta: mensaje.split(":")[0]}});
                

            if(mensaje.split(":")[0] == respuesta[1]){
                
                if(archivoFiles.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":false,
                        "sender":true,
                        "archivo":true,
                        "tipo":mensaje.split(".")[mensaje.split(".").length-1],
                        "nombre": mensaje.split(":")[1].split("/")[mensaje.split(":")[1].split("/").length-1].split("-")[1],
                        "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                    })
                    continue
                }
                

                if(archivosImagenes.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":false,
                        "sender":true,
                        "archivo":true,
                        "tipo":"imagen",
                        "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                    })
                    continue
                }
                mensajes.push({
                    "mensaje": mensaje.split(":")[1],
                    "reciver":false,
                    "sender":true,
                    "archivo":false,
                    "tipo":"",
                    "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                })
            }else{
                if(archivoFiles.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":true,
                        "tipo":mensaje.split(".")[mensaje.split(".").length-1],
                        "nombre": mensaje.split(":")[1].split("/")[mensaje.split(":")[1].split("/").length-1].split("-")[1],
                        "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                    })
                    continue
                }
                if(archivosImagenes.includes(mensaje.split(".")[mensaje.split(".").length-1])){
                    mensajes.push({
                        "mensaje": "public/chatFiles/"+mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":true,
                        "tipo":"imagen",
                        "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                    })
                    continue
                }
                
                mensajes.push({
                        "mensaje": mensaje.split(":")[1],
                        "reciver":true,
                        "sender":false,
                        "archivo":false,
                        "tipo":"",
                        "nombreEstudiante": estudiante1.dataValues.nombres.split(" ")[0]+" "+estudiante1.dataValues.apellidos.split(" ")[0]
                    })
                }
        }

    return res.status(200).json({ mensajes });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }
}
export const contEnvioArchivosGrupo = upload.single("archivo");

export const envioArchivosGrupo = async (req,res) =>{
    try {
        //0.idGrupo 1.numeroCuenta 
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });
        console.log(respuesta,req.file.filename);

        const grupoContenido= await grupo.findOne({where:{idGrupo:respuesta[0]}})

        if(isNull(grupoContenido)){
            return res.status(200).json({ message: "No existe este grupo" });    
        }

        grupoContenido.update({
            contenido: grupoContenido.dataValues.contenido.concat("\n"+`${respuesta[1]}:${req.file.filename}`)
        })
        grupoContenido.save()
        return res.status(200).json({ message: "Se envio el archivo" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }
}

export const nuevoChat = async (req,res) =>{
    try {
        //0.numeroCuenta(propio) 1.numeroCuenta2(del otro)
        const respuesta = [];
        forEach(req.body, async (conetnido) => {
            respuesta.push(conetnido);
        });

        console.log("esto es del nuevo chat:",respuesta);

        const chatContenido = await chat.findOne({where:{idUsuario:respuesta[0],idUsuario2:respuesta[1]}})
        const chatContenido1 = await chat.findOne({where:{idUsuario:respuesta[1],idUsuario2:respuesta[0]}})

        if(isNull(chatContenido) && isNull(chatContenido1)){
            return res.status(200).json({ message: "No existe este chat" });    
        }

        if(!isNull(chatContenido)){
            chatContenido.update({
                estado: true
            })

            chatContenido.save()    
        }        
        if(!isNull(chatContenido1)){
            chatContenido1.update({
                estado: true
            })
    
            chatContenido1.save() 
        }

       

        return res.status(200).json({ message: "Se creo el chat" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error del servidor"})
    }
}
