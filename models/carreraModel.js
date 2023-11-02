import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const carrera = sequelize.define(
  "carrera",
  {
    nombreCarrera: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    facultad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipoPeriodo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [["Semestral", "Trimestral"]],
          msg: "Tipo de periodo no válido",
        },
      },
    },
    examen: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: {
          args: [["PAM", "PCCNS", "PPEA"]],
          msg: "Tipo de examen no válido",
        },
      },
    },
  },
  {
    timestamps: false,
  }
);

//carrera.sync();
