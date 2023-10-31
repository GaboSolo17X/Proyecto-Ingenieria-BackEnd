import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { docente } from "./docenteModel.js";
import bcrypt from "bcrypt";

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

jefeDepartamento.beforeCreate( async (jefeDepartamento, options) => {
    if(jefeDepartamento.claveJefe){
        try {
            const hashedPassword = await bcrypt.hash(jefeDepartamento.claveJefe, 10);
            jefeDepartamento.claveJefe = hashedPassword;
        } catch (error) {
            throw new Error(error);
        }
    }
});

//jefeDepartamento.sync();