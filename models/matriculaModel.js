import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { seccion } from "./seccionModel.js";
import { carrera } from "./carreraModel.js";
import { estudiante } from "./estudianteModel.js";

export const matricula = sequelize.define(
    'matricula', {
        idMatricula: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idSeccion: {
            type: DataTypes.INTEGER,
        },
        nombreCarrera: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        numeroCuenta: {
            type: DataTypes.STRING(11),
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
                    args: [["APR", "RPD", "NSP","ABN"]],
                    msg: "Estado no válido",
                },
            }
        },
        periodo:{
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["I", "II", "III"]],
                    msg: "Periodo no válido",
                },
            }
        },
    },{
        timestamps: false
    },
    {
        paranoid:   true
    }
);

matricula.belongsTo(seccion, {foreignKey: 'idSeccion', targetKey: 'idSeccion'});
matricula.belongsTo(carrera, {foreignKey: 'nombreCarrera', targetKey: 'nombreCarrera'});
matricula.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'});



matricula.sync();

