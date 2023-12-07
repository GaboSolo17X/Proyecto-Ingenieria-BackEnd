import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { seccion } from "./seccionModel.js";
import { estudiante } from "./estudianteModel.js";

export const listaEspera = sequelize.define(
    'listaEspera', {
        idListaEspera: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idSeccion: {
            type: DataTypes.INTEGER,
        },
        numeroCuenta: {
            type: DataTypes.STRING(11),
        },
        estado: {
            type: DataTypes.BOOLEAN,
        },
    }, {
        timestamps: false,
    }
);

listaEspera.belongsTo(seccion, {foreignKey: 'idSeccion', targetKey: 'idSeccion'});
listaEspera.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'});

listaEspera.sync();