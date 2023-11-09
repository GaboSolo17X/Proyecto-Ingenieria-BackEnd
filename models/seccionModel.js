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
            allowNull: false,
        },
    },{
        timestamps: false,
    }
);

seccion.belongsTo(docente, {foreignKey: 'numeroEmpleadoDocente', targetKey: 'numeroEmpleadoDocente'});
seccion.belongsTo(asignatura, {foreignKey: 'idAsignatura', targetKey: 'idAsignatura'});

seccion.sync();