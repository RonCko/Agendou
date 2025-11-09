import { sequelize } from "../config/database.js";
import "./usuario.js";
import "./clinica.js";
import "./paciente.js";
import "./agendamento.js";
import "./endereco.js";
import "./especialidade.js";

export async function syncModels() {
  try {
    await sequelize.sync({ alter: true }); // cria/atualiza as tabelas
    console.log("🟢 Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("🔴 Erro ao sincronizar tabelas:", error);
  }
}
