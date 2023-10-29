import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

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
            type: DataTypes.STRING(13),
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

    },{
        timestamps: false,
    }
)

//estudiante.sync();