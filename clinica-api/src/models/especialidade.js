import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Clinica } from "./clinica.js";

export const Especialidade = sequelize.define("Especialidade", {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Especialidade.belongsTo(Clinica, { foreignKey: "clinica_id", onDelete: "CASCADE" });
Clinica.hasMany(Especialidade, { foreignKey: "clinica_id" });
