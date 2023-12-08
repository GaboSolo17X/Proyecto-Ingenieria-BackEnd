import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { seccion } from "./seccionModel.js";


export const JustificacionCancelacionSeccion = sequelize.define(
    'JustificacionCancelacionSeccion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombreSeccion: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    justificacion:{
        type: DataTypes.STRING(500),
        allowNull: false,
    },

}
);


JustificacionCancelacionSeccion.sync();