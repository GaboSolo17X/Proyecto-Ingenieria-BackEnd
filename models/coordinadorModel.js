import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { docente } from "./docenteModel.js";
import bcrypt from "bcrypt";

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

cordinadorDocente.beforeCreate( async (cordinadorDocente, options) => {
    if(cordinadorDocente.claveCoordinador){
        try {
            const hashedPassword = await bcrypt.hash(cordinadorDocente.claveCoordinador, 10);
            cordinadorDocente.claveCoordinador = hashedPassword;
        } catch (error) {
            throw new Error(error);
        }
    }
});

cordinadorDocente.sync();