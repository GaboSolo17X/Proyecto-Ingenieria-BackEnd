import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const fotoEstudiante = sequelize.define(
    "fotoEstudiante", {
        idfotoEstudiante: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        numeroCuenta: {
            type: DataTypes.STRING(11),
            allowNull: false,

        }
        ,
        fotoEstudiante: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
    },{
        timestamps: false,
    }
);

fotoEstudiante.sync();
