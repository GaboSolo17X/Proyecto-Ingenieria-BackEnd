import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

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

administrador.beforeCreate( async (administrador, options) => {
    if(administrador.claveAdministrador){
        try {
            const hashedPassword = await bcrypt.hash(administrador.claveAdministrador, 10);
            administrador.claveAdministrador = hashedPassword;
        } catch (error) {
            throw new Error(error);
        }
    }
});

administrador.sync()

