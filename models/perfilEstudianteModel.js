import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { fotoEstudiante } from "./fotoEstudianteModel.js";
import { estudiante } from "./estudianteModel.js";

export const perfilEstudiante = sequelize.define(
    "perfilEstudiante", {
        numeroCuenta: {
            type: DataTypes.STRING(11),
            primaryKey: true,
        },
        idfotoEstudiante: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        descripcion: {
            type: DataTypes.STRING(700),
            allowNull: true,
        },

    },{
        timestamps: false,
    }
);


perfilEstudiante.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'});
perfilEstudiante.belongsTo(fotoEstudiante, {foreignKey: 'idfotoEstudiante', targetKey: 'idfotoEstudiante'});

perfilEstudiante.sync();