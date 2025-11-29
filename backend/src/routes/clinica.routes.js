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
 * /clinicas/{id}/horarios:
 *   post:
 *     tags: [Clínicas]
 *     summary: Configurar horários de atendimento
 *     description: Define os horários de atendimento da clínica por dia da semana
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
 *               - horarios
 *             properties:
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dia_semana
 *                     - hora_inicio
 *                     - hora_fim
 *                   properties:
 *                     dia_semana:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: '0=Domingo, 1=Segunda, ..., 6=Sábado'
 *                       example: 1
 *                     hora_inicio:
 *                       type: string
 *                       format: time
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       format: time
 *                       example: "12:00"
 *                 example:
 *                   - dia_semana: 1
 *                     hora_inicio: "08:00"
 *                     hora_fim: "12:00"
 *                   - dia_semana: 1
 *                     hora_inicio: "14:00"
 *                     hora_fim: "18:00"
 *     responses:
 *       200:
 *         description: Horários configurados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Horários configurados com sucesso
 *                 horarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HorarioAtendimento'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/:id/horarios', verificarToken, eClinicaOuAdmin, ClinicaController.configurarHorarios);

export default router;
