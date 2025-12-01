import express from 'express';
import authRoutes from './auth.routes.js';
import clinicaRoutes from './clinica.routes.js';
import agendamentoRoutes from './agendamento.routes.js';
import especializacaoRoutes from './especializacao.routes.js';
import uploadRoutes from './upload.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import avaliacaoRoutes from './avaliacao.routes.js';

const router = express.Router();

// Rota de saúde da API
router.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API Agendou - Sistema de Agendamento de Clínicas',
    versao: '2.0.0',
    status: 'online',
    features: [
      'Autenticação JWT',
      'CRUD Completo',
      'Upload de Fotos',
      'Dashboard com Estatísticas',
      'Filtros Avançados'
    ]
  });
});

// Rotas da aplicação
router.use('/auth', authRoutes);
router.use('/clinicas', clinicaRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/especializacoes', especializacaoRoutes);
router.use('/upload', uploadRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/avaliacoes', avaliacaoRoutes);

export default router;
