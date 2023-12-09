import { chat } from "../models/chatModel.js";
import { grupo } from "../models/grupoModel.js";

//funcion para actualizar la base de datos
const actualizarChat = async (destinatario,mensaje,numeroCuenta) => {
    try {
    
        const usuarios = destinatario.split("-")
        const chatActual = await chat.findOne({where:{idUsuario:usuarios[0],idUsuario2:usuarios[1]}})

        if(chatActual == null){
            throw new Error("No se encontro el chat")
        }

        chatActual.update({
            contenido:chatActual.dataValues.contenido.concat("\n"+`${numeroCuenta}: ${mensaje}`)
        })

        chatActual.save()
        
        return true
    } catch (error) {
        console.log(error)
    }

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
    
        socket.on('joinSala', (sala) => {
            //console.log(sala.sala)
            socket.join(sala.sala);
            console.log(`El usuario ${socket.id} se ha unido a la sala ${sala.sala}`);
            
            //${Array.from(socket.rooms)}
          });
          
          socket.on('VerificacionSala', (cuentas) => {
            //console.log(cuentas)
            const sala = cuentas._value.usuario+"-"+cuentas._value.usuario1
            const estaEnSala = socket.rooms.has(sala);
            console.log(`El usuario ${socket.id} ${estaEnSala ? 'está' : 'no está'} en la sala ${sala}`);
                io.emit("VerificacionSala",sala)
            //conexion para grupos
    
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
            actualizarChat(destinatario,mensaje,numeroCuenta)


        })

        //conexion para grupos
        socket.on('joinGrupo', (arrayUsuarios) => {
            console.log(arrayUsuarios)
            let sala = ""
            for (let index = 0; index < arrayUsuarios.length; index++) {
                sala = sala.concat(arrayUsuarios[index]+"-")
            }
            socket.join(sala);
            console.log(`El usuario ${socket.id} se ha unido a la sala ${sala}`);
          });

        //verificar si esta en la sala para grupos  
        socket.on('VerificacionGrupo', (cuentas) => {
            //console.log(cuentas)
            let sala = ""
            for (let index = 0; index < arrayUsuarios.length; index++) {
                sala = sala.concat(arrayUsuarios[index]+"-")
            }
            const estaEnSala = socket.rooms.has(sala);
            console.log(`El usuario ${socket.id} ${estaEnSala ? 'está' : 'no está'} en la sala ${sala}`);
            io.emit("VerificacionGrupo",sala)
            //conexion para grupos
          });

        //enviar mensaje a un grupo
        socket.on('mensajeGrupo',(data)=>{
            const { grupoDestino, mensaje, numeroCuenta } = data;
            //enviar mensaje del servidor al cliente
            console.log(destinatario, mensaje, numeroCuenta)
            const tiempoActual = new Date()
            const contenido = {
                "sender":numeroCuenta,
                "mensaje":mensaje,
                "time":tiempoActual
            }
            socket.broadcast.to(grupoDestino).emit('grupo', contenido);
        });
            
            //io.to().emit("mensaje",mensaje)
            
            
        
            socket.on('disconnect', ()=>{console.log('se desconecto el usuario')})
    });
}