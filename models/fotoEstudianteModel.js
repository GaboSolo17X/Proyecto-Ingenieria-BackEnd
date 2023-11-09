import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const fotoEstudiante = sequelize.define(
    "fotoEstudiante", {
        idfotoEstudiante: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fotoEstudiante: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
    },{
        timestamps: false,
    }
);

fotoEstudiante.sync();
