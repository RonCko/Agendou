import express from 'express';
import AgendamentoController from '../controllers/AgendamentoController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas de agendamento exigem autenticação
router.use(verificarToken);

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     tags: [Agendamentos]
 *     summary: Listar agendamentos
 *     description: |
 *       - **Paciente**: Retorna seus próprios agendamentos
 *       - **Clínica**: Retorna agendamentos recebidos com filtros opcionais
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, confirmado, realizado, cancelado]
 *         description: Filtrar por status (apenas para clínica)
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *         example: "2025-12-31"
 *       - in: query
 *         name: especializacao_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por especialização (apenas para clínica)
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agendamentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agendamento'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', AgendamentoController.listar);

/**
 * @swagger
 * /agendamentos/disponibilidade:
 *   get:
 *     tags: [Agendamentos]
 *     summary: Verificar disponibilidade de horários
 *     description: Retorna horários disponíveis e ocupados para uma clínica/especialização em uma data específica. Esta é uma **regra de negócio** importante do sistema.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clinica_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da clínica
 *         example: '215e6b3d-4c7d-4eb3-8c3a-6ee837da97c8'
 *       - in: query
 *         name: especializacao_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da especialização
 *         example: '215e6b3d-4c7d-4eb3-8c3a-6ee837da97c8'
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data para verificar disponibilidade
 *         example: "2025-02-15"
 *     responses:
 *       200:
 *         description: Horários disponíveis e ocupados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   format: date
 *                   example: "2025-02-15"
 *                 horariosDisponiveis:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["08:00", "08:30", "09:00", "09:30", "10:00"]
 *                 horariosOcupados:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["10:30", "11:00"]
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/disponibilidade', AgendamentoController.verificarDisponibilidade);

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     tags: [Agendamentos]
 *     summary: Buscar agendamento por ID
 *     description: Retorna detalhes de um agendamento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *     responses:
 *       200:
 *         description: Detalhes do agendamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agendamento:
 *                   $ref: '#/components/schemas/Agendamento'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', AgendamentoController.buscarPorId);

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     tags: [Agendamentos]
 *     summary: Criar novo agendamento
 *     description: |
 *       Cria um novo agendamento. Apenas pacientes podem criar agendamentos.
 *       
 *       **Validações automáticas (Regras de Negócio):**
 *       - ✅ Verifica se o horário está disponível
 *       - ✅ Valida se a clínica oferece a especialização
 *       - ✅ Verifica horário de atendimento da clínica
 *       - ✅ Não permite agendamentos em datas passadas
 *       - ✅ Não permite agendamentos duplicados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clinica_id
 *               - especializacao_id
 *               - data_agendamento
 *               - hora_agendamento
 *             properties:
 *               clinica_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da clínica
 *                 example: '215e6b3d-4c7d-4eb3-8c3a-6ee837da97c8'
 *               especializacao_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID da especialização
 *                 example: '215e6b3d-4c7d-4eb3-8c3a-6ee837da97c8'
 *               data_agendamento:
 *                 type: string
 *                 format: date
 *                 description: Data da consulta
 *                 example: "2025-02-15"
 *               hora_agendamento:
 *                 type: string
 *                 format: time
 *                 description: Horário da consulta
 *                 example: "10:00"
 *               observacoes:
 *                 type: string
 *                 description: Observações adicionais
 *                 example: Primeira consulta
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Agendamento criado com sucesso
 *                 agendamento:
 *                   $ref: '#/components/schemas/Agendamento'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
router.post('/', AgendamentoController.criar);

/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     tags: [Agendamentos]
 *     summary: Atualizar agendamento
 *     description: |
 *       Atualiza um agendamento existente.
 *       - **Paciente**: Pode alterar data, hora e observações
 *       - **Clínica**: Pode alterar apenas o status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *         example: '415e6b3d-4c7d-4eb3-8c3a-6ee837da97ca'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_agendamento:
 *                 type: string
 *                 format: date
 *                 description: Nova data (apenas paciente)
 *                 example: "2025-02-16"
 *               hora_agendamento:
 *                 type: string
 *                 format: time
 *                 description: Novo horário (apenas paciente)
 *                 example: "14:00"
 *               observacoes:
 *                 type: string
 *                 description: Novas observações (apenas paciente)
 *                 example: Consulta de retorno
 *               status:
 *                 type: string
 *                 enum: [pendente, confirmado, realizado, cancelado]
 *                 description: Novo status (apenas clínica)
 *                 example: confirmado
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Agendamento atualizado com sucesso
 *                 agendamento:
 *                   $ref: '#/components/schemas/Agendamento'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', AgendamentoController.atualizar);

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     tags: [Agendamentos]
 *     summary: Cancelar agendamento
 *     description: Cancela um agendamento. Paciente e clínica podem cancelar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do agendamento
 *         example: '415e6b3d-4c7d-4eb3-8c3a-6ee837da97ca'
 *     responses:
 *       200:
 *         description: Agendamento cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Agendamento cancelado com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', AgendamentoController.deletar);

export default router;
