import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { estudiante } from "./estudianteModel.js";

export const matriculaCancelada = sequelize.define(

    "matriculaCancelada",{
        idMatriculaCancelada: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        codigoAsignatura:{
            type: DataTypes.STRING(8),
            allowNull: false,
        },
        nombreClase:{
            type: DataTypes.STRING(50),
            allowNull: false,
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
        numeroCuenta:{
            type: DataTypes.STRING(11),
            allowNull: false
        }

    },{
        timestamps:false

    }

)

matriculaCancelada.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'});
matriculaCancelada.sync()