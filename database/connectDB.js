import {sequelize} from '../config/confSequelize.js'

try{
    await sequelize.authenticate();
    console.log('Conexion a la base de datos exitosa')
}catch(error){
    console.log('Conexion a la base no exitosa', error);
}