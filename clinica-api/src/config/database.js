import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./src/config/test.db", // cria um arquivo local (tipo fake DB)
  logging: false,
});

export async function conectarBanco() {
  try {
    await sequelize.authenticate();
    console.log("🟢 Banco SQLite de teste conectado com sucesso!");
  } catch (error) {
    console.error("🔴 Erro ao conectar ao banco:", error);
  }
}
