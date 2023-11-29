import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { asignatura } from "./asignaturaModel.js";
import { estudiante } from "./estudianteModel.js";

export const historial = sequelize.define(
    "historial", {
        idHistorial: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        numeroCuenta: {
            type: DataTypes.STRING(11),
        },
        idAsignatura: {
            type: DataTypes.INTEGER,
        },
        calificacion:{
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 100,
            }
        },
        estado:{
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["APR", "RPD", "NSP"]],
                    msg: "Estado no válido",
                },
            }
        },
        periodo:{
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                esFormatoValido(value) {
                  // Utiliza una expresion regular para validar el formato deseado
                  const formatoValido = /^\d{4}-(I|II|III)$/.test(value);
                  if (!formatoValido) {
                    throw new Error('El formato del nombre no es valido. Debe ser <anio>-<I|II|III>.');
                  }
                }
            }
        },
    }, {
        timestamps: false,
    }
);

historial.belongsTo(asignatura, {foreignKey: 'idAsignatura', targetKey: 'idAsignatura'});
historial.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'});
historial.sync();