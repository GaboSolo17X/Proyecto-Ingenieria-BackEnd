import { chat } from "../models/chatModel.js";
import { grupo } from "../models/grupoModel.js";

//funcion para actualizar la base de datos
const actualizarChat = async (destinatario,mensaje,numeroCuenta) => {
    try {
        console.log(destinatario,mensaje,numeroCuenta)
        const usuarios = destinatario.split("-")
        const chatActual = await chat.findOne({where:{idUsuario:usuarios[0],idUsuario2:usuarios[1]}})
        if(chatActual == null){
            throw new Error("No se encontro el chat")
        }
        chatActual.update({
            contenido:chatActual.dataValues.contenido.concat("\n"+`${numeroCuenta}:${mensaje}`)
        })
        chatActual.save()
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

const actualizarGrupo = async (grupoDestino,mensaje,numeroCuenta) => {
    try {
        
        const gruposUsuario = grupoDestino.split("-")

        let miembrosParticipantes = gruposUsuario[0]
        for (let index = 1; index < gruposUsuario.length; index++) {
            miembrosParticipantes = miembrosParticipantes.concat(","+gruposUsuario[index])
        }
        console.log(miembrosParticipantes)

        const grupoActual = await grupo.findOne({where:{participantes:miembrosParticipantes}})
        if(grupoActual == null){
            throw new Error("No se encontro el grupo")
        }

        grupoActual.update({
            contenido:grupoActual.dataValues.contenido.concat("\n"+`${numeroCuenta}:${mensaje}`)
        })
        grupoActual.save()

        return true
    } catch (error) {
        console.log(error)
        return false
    }
}
    

async function obtenerUsuariosEnSala(io, sala) {
    // Obtener todos los identificadores de sockets en la sala usando await
    const socketsEnSala = await io.in(sala).allSockets();
  
    // Convertir el conjunto a un array para facilitar su manejo
    return socketsEnSala
  }


export default (io) => {
    io.on( 'connect', (socket) => {
        console.log(`Se a conectado un usuario con id  ${socket.id}`)
       
    
        socket.on('mensaje',(msg)=>{
            console.log("mensaje recibido: "+msg)
            io.emit("mensaje",msg)
        })
    
        socket.on('comprobarSala', (sala) => {
            const estaEnSala = socket.rooms.has(sala);
            console.log(`El usuario ${socket.id} ${estaEnSala ? 'está' : 'no está'} en la sala ${sala}`);
          });
    
        socket.on('joinSala', (sala,numeroCuenta) => {
            //console.log(sala.sala)
            socket.join(sala.sala);
            console.log(`El usuario ${socket.id} se ha unido a la sala ${sala.sala}`);
            io.emit("joinSala",numeroCuenta)
            //${Array.from(socket.rooms)}
          });
          
          socket.on('VerificacionSala',  (cuentas) => {
            //console.log(cuentas)
            const sala = cuentas._value.usuario+"-"+cuentas._value.usuario1
            const estaEnSala = socket.rooms.has(sala);
            console.log(`El usuario ${socket.id} ${estaEnSala ? 'está' : 'no está'} en la sala ${sala}`);
                io.emit("VerificacionSala",sala)
            
            
            //obtner usuarios en la sala
            
              });

            socket.on('verLinea', async (sala)=>{
                let usuariosEnSala = []
                usuariosEnSala =  await obtenerUsuariosEnSala(io, sala).then((socketsEnSala) => {
                    usuariosEnSala = Array.from(socketsEnSala)
                    for(let usuario of usuariosEnSala){
                        
                        if(usuario == socket.id){
                            continue
                        }
                        if(usuario != socket.id){
                            console.log(usuario+" esta en linea")
                            socket.in(sala).emit("usuariosEnSala","Conectado");
                        }else{ 
                            socket.in(sala).emit("usuariosEnSala","Desconectado");
                        }
                    }
            })
            
            

           
          });
    
        socket.on('privado',(data)=>{
            const { destinatario, mensaje, numeroCuenta } = data;
            //enviar mensaje del servidor al cliente
            console.log(destinatario, mensaje, numeroCuenta)
            const tiempoActual = new Date()
            const contenido = {
                "sender":numeroCuenta,
                "mensaje":mensaje,
                "time":tiempoActual
            }
            socket.broadcast.to(destinatario).emit('privado', contenido);
            //io.to().emit("mensaje",mensaje)
            //actualizar el chat en la base de datos
            if(actualizarChat(destinatario,mensaje,numeroCuenta)){
                //enviar respuesta a los dos clientes que son parte de la sala pero no a los clientes fuera de ella
                io.to(destinatario).emit('confirmacion', "Mensaje enviado privado")


                io.emit('confirmacion', "Mensaje existe")
            }

        })

        socket.on('archivo',(data)=>{
                io.emit('archivo', "hayArchivo")
        })



        //conexion para grupos
        socket.on('joinGrupo', (arrayUsuarios) => {
            console.log(arrayUsuarios)
            let sala = arrayUsuarios[0]
            for (let index = 1; index < arrayUsuarios.length; index++) {
                sala = sala.concat("-"+arrayUsuarios[index])
            }
            socket.join(sala);
            console.log(`El usuario ${socket.id} se ha unido a la sala ${sala}`);
          });

        //verificar si esta en la sala para grupos  
        socket.on('VerificacionGrupo', (cuenta) => {
            console.log(cuenta);
            const {integrantes, usuario} = cuenta
            let sala = integrantes[0]
            for (let index = 1; index < integrantes.length; index++) {
                sala = sala.concat("-"+integrantes[index])
            }
            const estaEnSala = socket.rooms.has(sala);
            console.log(`El usuario ${socket.id} ${estaEnSala ? 'está' : 'no está'} en la sala de grupo ${sala}`);

            io.emit("VerificacionGrupo",sala)
            //conexion para grupos
          });

        //enviar mensaje a un grupo
        socket.on('mensajeGrupo',(data)=>{
            const { grupoDestino, mensaje, numeroCuenta } = data;
            //enviar mensaje del servidor al cliente
            console.log(grupoDestino, mensaje, numeroCuenta)
            const tiempoActual = new Date()
            const contenido = {
                "sender":numeroCuenta,
                "mensaje":mensaje,
                "time":tiempoActual

            }
            socket.broadcast.to(grupoDestino).emit('grupo', contenido);

            //actualizar el chat en la base de datos
            if(actualizarGrupo(grupoDestino,mensaje,numeroCuenta)){
                //enviar respuesta a los dos clientes que son parte de la sala pero no a los clientes fuera de ella
                io.to(grupoDestino).emit('confirmacion', "Mensaje enviado al grupo")
            }
        });
            
            //io.to().emit("mensaje",mensaje)
            
            
        
            socket.on('disconnect', ()=>{
                console.log('se desconecto el usuario')
                io.emit("desconectado",socket.id)
                })
    });
}