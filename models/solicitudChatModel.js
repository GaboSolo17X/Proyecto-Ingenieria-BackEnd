import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const solicitudChat = sequelize.define(
    "solicitudChat",
    {
        idSolicitud: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        idUsuario: {
            // este es el usuario que la envia
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        idUsuario2: {
            //este es el usuario que la recibe
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        estado:{
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Aceptada", "Rechazada", "Pendiente"]],
                    msg: "Estado de solicitud no válido",
                },
            },
        }
    },
    {
        timestamps: false,
    }
    )

    solicitudChat.sync();