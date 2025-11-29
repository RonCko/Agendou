import express from 'express';
import ClinicaController from '../controllers/ClinicaController.js';
import { verificarToken, eClinicaOuAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas (catálogo)
router.get('/', ClinicaController.listar);
router.get('/:id', ClinicaController.buscarPorId);

// Rotas protegidas
router.put('/:id', verificarToken, eClinicaOuAdmin, ClinicaController.atualizar);
router.post('/:id/especializacoes', verificarToken, eClinicaOuAdmin, ClinicaController.adicionarEspecializacao);
router.delete('/:id/especializacoes/:especializacao_id', verificarToken, eClinicaOuAdmin, ClinicaController.removerEspecializacao);
router.post('/:id/horarios', verificarToken, eClinicaOuAdmin, ClinicaController.configurarHorarios);

export default router;
