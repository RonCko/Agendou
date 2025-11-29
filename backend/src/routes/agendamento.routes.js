import express from 'express';
import AgendamentoController from '../controllers/AgendamentoController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas de agendamento exigem autenticação
router.use(verificarToken);

router.get('/', AgendamentoController.listar);
router.get('/disponibilidade', AgendamentoController.verificarDisponibilidade);
router.get('/:id', AgendamentoController.buscarPorId);
router.post('/', AgendamentoController.criar);
router.put('/:id', AgendamentoController.atualizar);
router.delete('/:id', AgendamentoController.deletar);

export default router;
