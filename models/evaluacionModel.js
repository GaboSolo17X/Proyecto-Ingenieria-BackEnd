import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { matricula } from "./matriculaModel.js";
import { estudiante } from "./estudianteModel.js";
import { docente } from "./docenteModel.js";


export const evaluacion = sequelize.define(
    "evaluacion",{
        idEvalucion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idMatricula:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idEstudiante:{
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        idDocente:{
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        respuestas:{
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        respuestaTexto1:{
            type: DataTypes.STRING(700),
            allowNull: false,
        },
        respuestaTexto2:{
            type: DataTypes.STRING(700),
            allowNull: false,
        },
        estado:{
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        }
    },{ 
        timestamps: false 
    }
);

//foreignKey: es en este modelo
//targetKey: es en el modelo al que se hace referencia
evaluacion.belongsTo(matricula, {foreignKey: "idMatricula", targetKey: "idMatricula"});
evaluacion.belongsTo(estudiante, {foreignKey: "idEstudiante", targetKey: "numeroCuenta"});
evaluacion.belongsTo(docente, {foreignKey: "idDocente", targetKey: "numeroEmpleadoDocente"});

evaluacion.sync();