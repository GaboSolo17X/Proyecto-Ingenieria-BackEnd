import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { carrera } from "./carreraModel.js";

export const asignatura = sequelize.define(
    "asignatura", {
        idAsignatura: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombreCarrera:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        codigoAsignatura:{
            type: DataTypes.STRING(8),
            allowNull: false,
        },
        nombreClase: {
            type: DataTypes.STRING(50),
            allowNull: false,
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
        uv: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bannerAsignatura: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        requisitos:{
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        idCarrerasDisponibles:{
            //se ponen los id de las carreras separados por comas
            type: DataTypes.STRING(700),
            allowNull: false,
            defaultValue: "General"
    },

    },{
        timestamps: false,
    }
);

asignatura.belongsTo(carrera, {foreignKey: 'nombreCarrera', targetKey: 'nombreCarrera'});

asignatura.sync();

