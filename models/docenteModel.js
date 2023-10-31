import { sequelize } from "../config/confSequelize.js";
import { DataTypes } from "sequelize";
import { carrera } from "./carreraModel.js";
import bcrypt from "bcrypt";

export const docente = sequelize.define(
  "docente",
  {
    numeroEmpleadoDocente: {
      type: DataTypes.STRING(10),
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    identidad: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    foto: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    nombreCarrera: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    centroRegional: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    claveDocente: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

docente.belongsTo(carrera, {foreignKey: 'nombreCarrera' , targetKey: 'nombreCarrera'});

docente.beforeCreate(async (docente, options) => {
  if (docente.claveDocente) {
    try {
      const hashedPassword = await bcrypt.hash(docente.claveDocente, 10);
      docente.claveDocente = hashedPassword;
    } catch (error) {
      throw new Error(error);
    }
  }
});

//docente.sync()
