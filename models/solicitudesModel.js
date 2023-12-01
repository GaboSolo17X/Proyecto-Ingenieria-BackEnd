import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { matricula } from "./matriculaModel.js";
import { estudiante } from "./estudianteModel.js";

export const solicitud = sequelize.define(
    "solicitud" , { 
        idSolicitud: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tipoSolicitud: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate:  {
                isIn:{
                    args: [["Cambio de Carrera", "Cambio de Centro", "Cancelacion Excepcional", "Pago Reposicion"]],
                    msg: "Tipo de solicitud no valido",
                }
            }
        },
        recurso:{
            type: DataTypes.STRING(200),
            allowNull: true
        },
        diccionario: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        justificacion: {
            type: DataTypes.STRING(700),
            allowNull: true
        },
        idMatricula: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        numeroCuenta: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Pendiente", "Aprobada", "Rechazada"]],
                    msg: "Estado no válido",
                },
            }
        },

    }, {
        timestamps: false,
    }
);

solicitud.belongsTo(matricula, {foreignKey: "idMatricula", targetKey: "idMatricula"});
solicitud.belongsTo(estudiante, {foreignKey: "numeroCuenta", targetKey: "numeroCuenta"});

solicitud.sync();