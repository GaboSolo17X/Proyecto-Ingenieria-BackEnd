//HORA DISPONIBLES DOCENTE
const seccionesFound = await seccion.findAll({where:{ numeroEmpleadoDocente: numeroEmpleadoDocente}}) 
    
//HORAS DISPONIBLES AULA
const seccionsFoundAula = await seccion.findAll({where:{ edificio: nombreEdificio, aula: numeroAula, dias: diasSeleccionados}})
console.log(seccionsFoundAula)
const seccionsPrueba = await seccion.findAll({where:{ edificio: nombreEdificio, aula: numeroAula}})

//HORAS DISPONIBLES AULA Y HORA

if(seccionesFound.length == 0){
    if( seccionsFoundAula.length == 0){
        return res.status(200).json({ message: "Horas disponibles", horas, dias:diasSemanaCompleto });


    }
    else{
        for(const seccion of seccionsFoundAula){
            const {horaInicial, horaFinal, dias} = seccion.dataValues
            //HORA FORMATEADA HORA INICIAL 
            diasEviar = dias
            const fecha = new Date(horaInicial)
            const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
            const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;


            //HORA FORMATEADA HORA FINAL
            const fechaF = new Date(horaFinal)
            const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
            const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;


            const indiceInicial = horas.indexOf(horaFormateadaUTC)
            const indiceFinal = horas.indexOf(horaFormateadaUTCF)

            if (indiceInicial !== -1 && indiceFinal !== -1) {
                horas.splice(indiceInicial, indiceFinal - indiceInicial );
            }
        }

        for( const seccion of seccionsPrueba){
            const {horaInicial, horaFinal, dias} = seccion.dataValues
            //HORA FORMATEADA HORA INICIAL 
            diasEviar = dias
            const fecha = new Date(horaInicial)
            const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
            const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

             //HORA FORMATEADA HORA FINAL
            const fechaF = new Date(horaFinal)
            const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
            const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;

            const indiceInicial = horas.indexOf(horaFormateadaUTC)
            const indiceFinal = horas.indexOf(horaFormateadaUTCF)

            if (indiceInicial !== -1 && indiceFinal !== -1) {
                horas.splice(indiceInicial, indiceFinal - indiceInicial );
            }
        }

        return res.status(200).json({ message: "Horas disponibles", horas, dias: diasEviar});
    }
}else{
    for(const seccion of seccionesFound){
        const {horaInicial, horaFinal} = seccion.dataValues
            
        //HORA FORMATEADA HORA INICIAL 
        const fecha = new Date(horaInicial)
        const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
        const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

        //HORA FORMATEADA HORA FINAL
        const fechaF = new Date(horaFinal)
        const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
        const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;

        const indiceInicial = horas.indexOf(horaFormateadaUTC)
        const indiceFinal = horas.indexOf(horaFormateadaUTCF)

        if (indiceInicial !== -1 && indiceFinal !== -1) {
            horas.splice(indiceInicial, indiceFinal - indiceInicial );
        }
        console.log(horas)
    }

    
    for( const seccion of seccionsPrueba){
        const {horaInicial, horaFinal, dias} = seccion.dataValues
        //HORA FORMATEADA HORA INICIAL 
        diasEviar = dias
        const fecha = new Date(horaInicial)
        const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
        const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

         //HORA FORMATEADA HORA FINAL
        const fechaF = new Date(horaFinal)
        const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
        const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;

        const indiceInicial = horas.indexOf(horaFormateadaUTC)
        const indiceFinal = horas.indexOf(horaFormateadaUTCF)

        if (indiceInicial !== -1 && indiceFinal !== -1) {
            horas.splice(indiceInicial, indiceFinal - indiceInicial );
        }
        console.log(horas)
    }

    if( seccionsFoundAula.length == 0){
        return res.status(200).json({ message: "Horas disponibles", horas});
    }
    else{
        for(const seccion of seccionsFoundAula){
        const {horaInicial, horaFinal, dias} = seccion.dataValues
        diasEviar = dias
        //HORA FORMATEADA HORA INICIAL 
        const fecha = new Date(horaInicial)
        const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
        const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

        //HORA FORMATEADA HORA FINAL
        const fechaF = new Date(horaFinal)
        const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
        const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
        const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;

        const indiceInicial = horas.indexOf(horaFormateadaUTC)
        const indiceFinal = horas.indexOf(horaFormateadaUTCF)

        if (indiceInicial !== -1 && indiceFinal !== -1) {
            horas.splice(indiceInicial, indiceFinal - indiceInicial );
        }
        }
        console.log(horas)

        
        for( const seccion of seccionsPrueba){
            const {horaInicial, horaFinal, dias} = seccion.dataValues
            //HORA FORMATEADA HORA INICIAL 
            diasEviar = dias
            const fecha = new Date(horaInicial)
            const horasUTC = fecha.getUTCHours().toString().padStart(2, '0');
            const minutosUTC = fecha.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTC = `${horasUTC}:${minutosUTC}`;

             //HORA FORMATEADA HORA FINAL
            const fechaF = new Date(horaFinal)
            const horasUTCF = fechaF.getUTCHours().toString().padStart(2, '0');
            const minutosUTCF = fechaF.getUTCMinutes().toString().padStart(2, '0');
            const horaFormateadaUTCF = `${horasUTCF}:${minutosUTCF}`;

            const indiceInicial = horas.indexOf(horaFormateadaUTC)
            const indiceFinal = horas.indexOf(horaFormateadaUTCF)

            if (indiceInicial !== -1 && indiceFinal !== -1) {
                horas.splice(indiceInicial, indiceFinal - indiceInicial );
            }
        }
        console.log(horas)

        return res.status(200).json({ message: "Horas disponibles", horas, dias: diasEviar});
    }
}


///////////////

console.log(this.uv);
console.log(this.selectedDays);

let indice = this.hours.indexOf(newVal);
const [hora, minutos] = this.hours[indice].split(":");
const horasEnNumero = parseInt(hora, 10);
const minutosEnNumero = parseInt(minutos, 10);
const valorNumerico = horasEnNumero * 100 + minutosEnNumero + 100;
const horasString = Math.floor(valorNumerico / 100);
const minutosString = valorNumerico % 100;
const horaEnFormatoString = `${String(horasString).padStart(
  2,
  "0"
)}:${String(minutosString).padStart(2, "0")}`;
this.selectedEndHour = null;
this.finalHours = [];

if (newVal == "19:00") {
  this.finalHours.push("20:00");
} else {
  this.finalHours = this.hours.slice(indice + 1);
  let indiceVerificar = this.finalHours.indexOf(horaEnFormatoString);
  if (indiceVerificar == -1) {
    this.finalHours.unshift(horaEnFormatoString);
  }
}