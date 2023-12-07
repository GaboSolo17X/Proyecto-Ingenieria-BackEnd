import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const chat = sequelize.define(
    "chat",
    {
        idChat: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        idUsuario: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        idUsuario2: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        contenido: {
            type: DataTypes.STRING(4000),
            allowNull: true,
        },
        estado:{
            type: DataTypes.BOOLEAN,
        }
    },
    {
        timestamps: false,
    }
)

chat.sync();