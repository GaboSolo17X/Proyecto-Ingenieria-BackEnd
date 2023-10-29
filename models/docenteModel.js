import {sequelize} from '../config/confSequelize.js';
import {DataTypes} from 'sequelize';

export const docente = sequelize.define('docente', {
    numeroEmpleadoDocente: {
        type: DataTypes.STRING(10),
        primaryKey: true,
    },
    nombres: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    identidad: {
        type: DataTypes.STRING(13),
        allowNull: false
    },
    foto: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    centroRegional: {
        type: DataTypes.STRING(10),
        allowNull: false,   
    },
    claveDocente: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    correo : {
        type: DataTypes.STRING(100),
        allowNull: false
    },

},
{
    timestamps: false,
}



);

//docente.sync()