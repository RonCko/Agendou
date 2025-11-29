import { Sequelize } from 'sequelize';
import config from './config.js';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: config.database.dialectOptions,
    logging: config.database.logging,
    pool: config.database.pool,
    timezone: '-03:00' // Fuso horário do Brasil (GMT-3)
  }
);

export const conectarBanco = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com Supabase PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    return false;
  }
};

export const sincronizarModelos = async (force = false) => {
  try {
    // Não usar alter ou force quando as tabelas já existem no Supabase
    // As tabelas foram criadas via SQL com views dependentes
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos Sequelize sincronizados (verificação)');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error.message);
    // Não lançar erro, pois as tabelas já existem
    console.log('💡 As tabelas já foram criadas no Supabase via SQL');
  }
};

export default sequelize;
