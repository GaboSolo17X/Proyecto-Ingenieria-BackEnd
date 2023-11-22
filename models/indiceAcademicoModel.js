import { estudiante } from "./estudianteModel.js";
import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const indiceAcademico = sequelize.define(
    "indiceAcademico", {
        numeroCuenta:{
            type: DataTypes.STRING(11),
            primaryKey: true
        },
        indiceGlobal:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },{
        timestamps: false,
    }
)

indiceAcademico.belongsTo(estudiante, {foreignKey: 'numeroCuenta', targetKey: 'numeroCuenta'})


indiceAcademico.sync()