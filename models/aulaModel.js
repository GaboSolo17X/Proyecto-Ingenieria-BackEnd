import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { edificio } from "./edificioModel.js";

export const aula = sequelize.define(
    "aula", {
        numeroAula:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idEdificio:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },

    }, {
        timestamps: false,
    }
);

aula.belongsTo(edificio, {foreignKey: 'idEdificio', targetKey: 'idEdificio'});
aula.sync();