import express from 'express';
import ClinicaController from '../controllers/ClinicaController.js';
import { verificarToken, eClinicaOuAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /clinicas:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar todas as clínicas
 *     description: Retorna lista de clínicas ativas com filtros opcionais
 *     parameters:
 *       - in: query
 *         name: especializacao_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da especialização
 *         example: 1
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Buscar por nome (parcial)
 *         example: Vida
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *         example: São Paulo
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado (UF)
 *         example: SP
 *     responses:
 *       200:
 *         description: Lista de clínicas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clinicas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Clinica'
 */
router.get('/', ClinicaController.listar);

/**
 * @swagger
 * /clinicas/{id}:
 *   get:
 *     tags: [Clínicas]
 *     summary: Buscar clínica por ID
 *     description: Retorna detalhes completos de uma clínica específica incluindo especializações e horários
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes da clínica
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clinica:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Clinica'
 *                     - type: object
 *                       properties:
 *                         especializacoes:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Especializacao'
 *                         horarios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/HorarioAtendimento'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', ClinicaController.buscarPorId);

/**
 * @swagger
 * /clinicas/{id}:
 *   put:
 *     tags: [Clínicas]
 *     summary: Atualizar dados da clínica
 *     description: Atualiza informações da clínica (apenas a própria clínica ou admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Clínica Premium Atualizada
 *               endereco:
 *                 type: string
 *                 example: Rua das Flores, 456
 *               cidade:
 *                 type: string
 *                 example: São Paulo
 *               estado:
 *                 type: string
 *                 example: SP
 *               telefone:
 *                 type: string
 *                 example: "1133335555"
 *     responses:
 *       200:
 *         description: Clínica atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Clínica atualizada com sucesso
 *                 clinica:
 *                   $ref: '#/components/schemas/Clinica'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', verificarToken, eClinicaOuAdmin, ClinicaController.atualizar);

/**
 * @swagger
 * /clinicas/{id}/especializacoes:
 *   post:
 *     tags: [Clínicas]
 *     summary: Adicionar especialização à clínica
 *     description: Adiciona uma nova especialização que a clínica oferece
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - especializacao_id
 *               - valor_consulta
 *             properties:
 *               especializacao_id:
 *                 type: integer
 *                 description: ID da especialização
 *                 example: 1
 *               valor_consulta:
 *                 type: number
 *                 format: decimal
 *                 description: Valor da consulta nesta especialização
 *                 example: 250.00
 *     responses:
 *       201:
 *         description: Especialização adicionada com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
router.post('/:id/especializacoes', verificarToken, eClinicaOuAdmin, ClinicaController.adicionarEspecializacao);

/**
 * @swagger
 * /clinicas/{id}/especializacoes/{especializacao_id}:
 *   delete:
 *     tags: [Clínicas]
 *     summary: Remover especialização da clínica
 *     description: Remove uma especialização que a clínica oferece
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *       - in: path
 *         name: especializacao_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da especialização
 *     responses:
 *       200:
 *         description: Especialização removida com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id/especializacoes/:especializacao_id', verificarToken, eClinicaOuAdmin, ClinicaController.removerEspecializacao);

/**
 * @swagger
 * /clinicas/{id}/horarios/configurar:
 *   post:
 *     tags: [Clínicas]
 *     summary: Configurar horários recorrentes
 *     description: |
 *       Configura horários recorrentes baseados em padrões, ao invés de criar slots individuais.
 *       Reduz drasticamente o número de registros no banco (1 config vs 600+ slots).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - especializacao_id
 *               - dias_semana
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               especializacao_id:
 *                 type: string
 *                 format: uuid
 *               dias_semana:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4, 5]
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               hora_fim:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *               duracao_slot:
 *                 type: integer
 *                 default: 30
 *               intervalo_almoco:
 *                 type: boolean
 *                 default: false
 *               hora_inicio_almoco:
 *                 type: string
 *                 format: time
 *                 example: "12:00"
 *               hora_fim_almoco:
 *                 type: string
 *                 format: time
 *                 example: "13:00"
 *               data_inicio:
 *                 type: string
 *                 format: date
 *               data_fim:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Configuração criada
 *       200:
 *         description: Configuração atualizada
 */
router.post('/:id/horarios/configurar', verificarToken, eClinicaOuAdmin, ClinicaController.configurarHorariosRecorrentes);

/**
 * @swagger
 * /clinicas/{id}/horarios/configuracoes:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar configurações de horários
 *     description: Retorna configurações recorrentes de horários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da clínica
 *       - in: query
 *         name: especializacao_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de configurações
 */
router.get('/:id/horarios/configuracoes', verificarToken, ClinicaController.listarConfiguracoesHorarios);

/**
 * @swagger
 * /clinicas/{id}/horarios/bloquear:
 *   post:
 *     tags: [Clínicas]
 *     summary: Bloquear horários específicos (exceções)
 *     description: |
 *       Cria exceções/bloqueios para horários específicos.
 *       Usado para feriados, bloqueios pontuais, etc.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - especializacao_id
 *               - data_excecao
 *             properties:
 *               especializacao_id:
 *                 type: string
 *               data_excecao:
 *                 type: string
 *                 format: date
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *               hora_fim:
 *                 type: string
 *                 format: time
 *               tipo:
 *                 type: string
 *                 enum: [bloqueio, feriado, evento, customizado]
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Horário bloqueado
 */
router.post('/:id/horarios/bloquear', verificarToken, eClinicaOuAdmin, ClinicaController.bloquearHorarios);

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar exceções/bloqueios
 *     description: Retorna lista de horários bloqueados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: especializacao_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de exceções
 */
router.get('/:id/horarios/excecoes', verificarToken, ClinicaController.listarExcecoes);

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes/{excecao_id}:
 *   delete:
 *     tags: [Clínicas]
 *     summary: Remover exceção (desbloquear)
 *     description: Remove um bloqueio específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: excecao_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exceção removida
 */
router.delete('/:id/horarios/excecoes/:excecao_id', verificarToken, eClinicaOuAdmin, ClinicaController.removerExcecao);

export default router;
