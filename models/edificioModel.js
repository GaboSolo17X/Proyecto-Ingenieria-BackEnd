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
        centroRegional: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["UNAH-CU", "UNAH-VS", "CURLA"]],
                    msg: "Centro Regional no válido",
                },
            }
        },
        niveles: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        timestamps: false,
    }
);

edificio.sync();