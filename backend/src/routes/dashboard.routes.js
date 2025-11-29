import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { verificarToken, estaLogado, eClinica, ePaciente, eAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Dashboard da clínica
router.get('/clinica', [verificarToken, estaLogado, eClinica], DashboardController.clinica);

// Dashboard do paciente
router.get('/paciente', [verificarToken, estaLogado, ePaciente], DashboardController.paciente);

// Dashboard admin
router.get('/admin', [verificarToken, estaLogado, eAdmin], DashboardController.admin);

export default router;
