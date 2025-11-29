import app from './app.js';
import config from './config/config.js';
import { conectarBanco, sincronizarModelos } from './config/database.js';
import './models/index.js'; // Importar modelos para registrar relacionamentos

const PORT = config.server.port;

async function iniciarServidor() {
  try {
    console.log('🚀 Iniciando servidor Agendou...\n');

    // Conectar ao banco
    const conexaoOk = await conectarBanco();
    if (!conexaoOk) {
      console.error('❌ Falha ao conectar ao banco. Servidor não iniciado.');
      process.exit(1);
    }

    // Verificar modelos (as tabelas já foram criadas via SQL no Supabase)
    console.log('💡 Usando tabelas criadas no Supabase via SQL schema');
    await sincronizarModelos();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
      console.log(`📚 API disponível em http://localhost:${PORT}/api`);
      console.log(`🌍 Ambiente: ${config.server.env}`);
      console.log(`\n💡 Rotas disponíveis:`);
      console.log(`   POST   /api/auth/registrar`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/clinicas`);
      console.log(`   GET    /api/especializacoes`);
      console.log(`   GET    /api/agendamentos`);
      console.log(`   POST   /api/agendamentos`);
      console.log(`\n🔒 Use JWT Bearer Token para rotas protegidas\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
