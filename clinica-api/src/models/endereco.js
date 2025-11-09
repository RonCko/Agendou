import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";

export const Endereco = sequelize.define("Endereco", {
  cep: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rua: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Endereco.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Usuario.hasOne(Endereco, { foreignKey: "usuario_id" });
