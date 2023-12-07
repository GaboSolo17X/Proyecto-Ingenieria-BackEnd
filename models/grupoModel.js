import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const grupo = sequelize.define(
    "grupo",
    {
        idGrupo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        participantes: {
            type: DataTypes.STRING(700),
            allowNull: false,
        },
        contenido: {
            type: DataTypes.STRING(4000),
            allowNull: true,
        },
        nombreGrupo:{
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        fotoGrupo:{
            type: DataTypes.STRING(200),
            allowNull: false
        }

    },
    { timestamps: false });


    grupo.sync();