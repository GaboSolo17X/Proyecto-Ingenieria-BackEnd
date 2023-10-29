import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { docente } from "./docenteModel.js";

export const jefeDepartamento = sequelize.define(
    "jefeDepartamento",
    {
        numeroEmpleadoDocente: {
            type: DataTypes.STRING(10),
            primaryKey: true,
        },
        claveJefe: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    },
    {
        timestamps: false,
    }
)

jefeDepartamento.belongsTo(docente, {foreignKey: 'numeroEmpleadoDocente' , targetKey: 'numeroEmpleadoDocente'});

//jefeDepartamento.sync();