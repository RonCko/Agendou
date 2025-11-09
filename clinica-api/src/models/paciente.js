import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Usuario } from "./usuario.js";

export const Paciente = sequelize.define("Paciente", {
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

Paciente.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Usuario.hasOne(Paciente, { foreignKey: "usuario_id" });
