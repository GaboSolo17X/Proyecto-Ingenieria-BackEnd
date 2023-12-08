import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { edificio } from "./edificioModel.js";

export const aula = sequelize.define(
    "aula", {
        idAula: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        numeroAula:{
            type: DataTypes.STRING(50),
            primaryKey: true,
        },
        idEdificio:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nivel:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Disponible", "No Disponible"]],
                    msg: "Estado No Valido",
                },
            }
        },
        capacidad:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["Aula", "Laboratorio"]],
                    msg: "Tipo de Aula no valido",
                },
            }
        },

    }, {
        timestamps: false,
    }
);

aula.belongsTo(edificio, {foreignKey: 'idEdificio', targetKey: 'idEdificio'});
aula.sync();