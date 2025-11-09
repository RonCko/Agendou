const { query } = require('../database');

// Criação de tabelas
const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  patient_name VARCHAR(100) NOT NULL,
  date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  try {
    await query(createTables);
    console.log('Tabelas criadas com sucesso');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
  }
}

// Se executado diretamente
if (require.main === module) {
  migrate().then(() => process.exit());
}