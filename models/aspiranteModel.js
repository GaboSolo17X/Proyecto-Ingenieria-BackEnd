import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const aspirante = sequelize.define(
    "aspirante",
    {
        identidad: {
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
        carreraPrincipal: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        carreraSecundaria: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        fotoCertificado: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        correoPersonal: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        centroRegional: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["UNAH-CU", "UNAH-VS", "CURLA"]],
                    msg: "Centro Regional no válido",
                },
            }
        },

        
    },
    {
        timestamps: false,
    }
);

//aspirante.sync()