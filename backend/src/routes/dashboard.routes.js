import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { verificarToken, estaLogado, eClinica, ePaciente, eAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/clinica:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard da clínica
 *     description: |
 *       Retorna estatísticas e dados do dashboard para clínicas.
 *       Inclui resumo de agendamentos, receita, próximos agendamentos e gráficos.
 *       
 *       **Acesso:** Apenas usuários do tipo clínica
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard da clínica
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumo:
 *                   type: object
 *                   properties:
 *                     totalAgendamentos:
 *                       type: integer
 *                       example: 150
 *                     agendamentosMes:
 *                       type: integer
 *                       example: 25
 *                     agendamentosHoje:
 *                       type: integer
 *                       example: 3
 *                     receitaTotal:
 *                       type: number
 *                       example: 37500.00
 *                     agendamentosPorStatus:
 *                       type: object
 *                       properties:
 *                         pendente:
 *                           type: integer
 *                         confirmado:
 *                           type: integer
 *                         realizado:
 *                           type: integer
 *                         cancelado:
 *                           type: integer
 *                 proximosAgendamentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agendamento'
 *                 agendamentosPorEspecializacao:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       especializacao:
 *                         type: string
 *                       total:
 *                         type: integer
 *                 graficoUltimos30Dias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       data_agendamento:
 *                         type: string
 *                         format: date
 *                       total:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/clinica', [verificarToken, estaLogado, eClinica], DashboardController.clinica);

/**
 * @swagger
 * /dashboard/paciente:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard do paciente
 *     description: |
 *       Retorna estatísticas e dados do dashboard para pacientes.
 *       Inclui resumo de consultas e próximos agendamentos.
 *       
 *       **Acesso:** Apenas usuários do tipo paciente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard do paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumo:
 *                   type: object
 *                   properties:
 *                     totalAgendamentos:
 *                       type: integer
 *                       example: 15
 *                     proximasConsultas:
 *                       type: integer
 *                       example: 2
 *                     consultasRealizadas:
 *                       type: integer
 *                       example: 10
 *                     consultasCanceladas:
 *                       type: integer
 *                       example: 3
 *                 proximosAgendamentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agendamento'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/paciente', [verificarToken, estaLogado, ePaciente], DashboardController.paciente);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Dashboard do admin
 *     description: |
 *       Retorna estatísticas gerais do sistema para administradores.
 *       
 *       **Acesso:** Apenas usuários do tipo admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard administrativo
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/admin', [verificarToken, estaLogado, eAdmin], DashboardController.admin);

export default router;
