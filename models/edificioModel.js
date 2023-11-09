import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const edificio = sequelize.define(
    "edificio", {
        idEdificio: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombreEdificio: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    }, {
        timestamps: false,
    }
);

edificio.sync();