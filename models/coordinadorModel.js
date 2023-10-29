import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { docente } from "./docenteModel.js";

export const cordinadorDocente = sequelize.define(
    "cordinadorDocente",
    {
        numeroEmpleadoDocente: {
            type: DataTypes.STRING(10),
            primaryKey: true,
        },
        claveCoordinador: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    },
    {
        timestamps: false,
    }
)

cordinadorDocente.belongsTo(docente, {foreignKey: 'numeroEmpleadoDocente' , targetKey: 'numeroEmpleadoDocente'});

//cordinadorDocente.sync();