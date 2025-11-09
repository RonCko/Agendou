import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Paciente } from "./paciente.js";
import { Clinica } from "./clinica.js";

export const Agendamento = sequelize.define("Agendamento", {
  data: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  medico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Agendamento.belongsTo(Paciente, { foreignKey: "paciente_id", onDelete: "CASCADE" });
Paciente.hasMany(Agendamento, { foreignKey: "paciente_id" });

Agendamento.belongsTo(Clinica, { foreignKey: "clinica_id", onDelete: "CASCADE" });
Clinica.hasMany(Agendamento, { foreignKey: "clinica_id" });
