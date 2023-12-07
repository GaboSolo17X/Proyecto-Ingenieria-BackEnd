import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { asignatura } from "./asignaturaModel.js";
import { docente } from "./docenteModel.js";

export const seccion = sequelize.define(
    "seccion", {
        idSeccion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombreSeccion: {
            type: DataTypes.STRING(4),
            allowNull: false,
        },
        idAsignatura:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        numeroEmpleadoDocente: {
            type: DataTypes.STRING(10),
        },
        cupos: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dias:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        aula:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        edificio:{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        horaInicial:{ 
            type: DataTypes.TIME,
            allowNull: false,
        },
        horaFinal:{
            type: DataTypes.TIME,
            allowNull: false,
        },
        linkVideo:{
            type: DataTypes.STRING(200),
            allowNull: true, //AQUI SE HIZO UN CAMBIO POR SI SE NOS OLVIDA SON LAS 4 AM 
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
        }
    },{
        timestamps: false,
    }
);

seccion.belongsTo(docente, {foreignKey: 'numeroEmpleadoDocente', targetKey: 'numeroEmpleadoDocente'});
seccion.belongsTo(asignatura, {foreignKey: 'idAsignatura', targetKey: 'idAsignatura'});

seccion.sync();