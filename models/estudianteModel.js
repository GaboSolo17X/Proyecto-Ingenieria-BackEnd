import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export const estudiante = sequelize.define(
    "estudiante",
    {
        numeroCuenta: {
            type: DataTypes.STRING(11),
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
            type: DataTypes.STRING(15),
            allowNull: false
        },
        carrera :{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        direccion :{
            type: DataTypes.STRING(100),
            allowNull: true
        },
        correoPersonal: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        centroRegional: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        claveEstudiante: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        carreraSecundaria: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null, 
        },

    },{
        timestamps: false,
    }
)

estudiante.sync();


estudiante.beforeCreate( async (estudiante, options) => {
    if(estudiante.claveEstudiante){
        try {
            const hashedPassword = await bcrypt.hash(estudiante.claveEstudiante, 10);
            estudiante.claveEstudiante = hashedPassword;
        } catch (error) {
            throw new Error(error);
        }
    }
});

estudiante.beforeUpdate( async (estudiante, options) => {
    if(estudiante.claveEstudiante){
        try {
            const hashedPassword = await bcrypt.hash(estudiante.claveEstudiante, 10);
            estudiante.claveEstudiante = hashedPassword;
        } catch (error) {
            throw new Error(error);
        }
    }
})
