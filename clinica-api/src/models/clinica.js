import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";

export const Clinica = sequelize.define("Clinica", {
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Clinica.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Usuario.hasOne(Clinica, { foreignKey: "usuario_id" });
