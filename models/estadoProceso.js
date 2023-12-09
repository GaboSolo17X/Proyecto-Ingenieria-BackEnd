import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";

export const estado_Proceso = sequelize.define(
  "estado_Proceso",
  {
    idProceso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreProceso: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    estado: {
      type: DataTypes.BOOLEAN, 
      allowNull: false,
    },
    //Formato YYYY-MM-DD
    fechaInicioDelProceso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fechaFinDelProceso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },


  },
  {
    timestamps: false,
  }
);

estado_Proceso.sync();
