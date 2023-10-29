import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const administrador = sequelize.define(
    "administrador",
    {
        numeroEmpleadoAdministrador: {
            type: DataTypes.STRING(13),
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
        claveAdministrador: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        correo : {
            type: DataTypes.STRING(100),
            allowNull: false
        },

    },{
        timestamps: false,
    }

);

//administrador.sync()

