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
 *                   example:
 *                     - id: 1
 *                       nome: "Clínica Vida Saudável"
 *                       cidade: "São Paulo"
 *                       estado: "SP"
 *                     - id: 2
 *                       nome: "Clínica Bem Estar"
 *                       cidade: "Rio de Janeiro"
 *                       estado: "RJ"
 */

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
 *                           example:
 *                             - id: 1
 *                               nome: "Cardiologia"
 *                             - id: 2
 *                               nome: "Dermatologia"
 *                         horarios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/HorarioAtendimento'
 *                           example:
 *                             - dia_semana: 1
 *                               hora_inicio: "08:00"
 *                               hora_fim: "18:00"
 *                             - dia_semana: 2
 *                               hora_inicio: "08:00"
 *                               hora_fim: "18:00"
 */

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
 *                   example:
 *                     id: 1
 *                     nome: "Clínica Premium Atualizada"
 *                     endereco: "Rua das Flores, 456"
 *                     cidade: "São Paulo"
 *                     estado: "SP"
 *                     telefone: "1133335555"
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Especialização adicionada com sucesso
 *                 especializacao:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: Cardiologia
 *                     valor_consulta:
 *                       type: number
 *                       example: 250.00
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Especialização removida com sucesso
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Configuração criada com sucesso
 *                 configuracao:
 *                   type: object
 *                   properties:
 *                     especializacao_id:
 *                       type: string
 *                       example: "1"
 *                     dias_semana:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3, 4, 5]
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 *       200:
 *         description: Configuração atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Configuração atualizada com sucesso
 *                 configuracao:
 *                   type: object
 *                   properties:
 *                     especializacao_id:
 *                       type: string
 *                       example: "1"
 *                     dias_semana:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3, 4, 5]
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configuracoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       especializacao_id:
 *                         type: string
 *                         example: "1"
 *                       dias_semana:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 2, 3, 4, 5]
 *                       hora_inicio:
 *                         type: string
 *                         example: "08:00"
 *                       hora_fim:
 *                         type: string
 *                         example: "18:00"
 */

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
 *           format: uuid
 *         description: ID da clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-25"
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               hora_fim:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *     responses:
 *       201:
 *         description: Bloqueio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Bloqueio criado com sucesso
 *                 bloqueio:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       example: "2025-12-25"
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 */

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar exceções de horários
 *     description: Retorna exceções de horários para uma clínica específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da clínica
 *     responses:
 *       200:
 *         description: Lista de exceções de horários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 excecoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       data:
 *                         type: string
 *                         example: "2025-12-25"
 *                       hora_inicio:
 *                         type: string
 *                         example: "08:00"
 *                       hora_fim:
 *                         type: string
 *                         example: "18:00"
 */

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes/{excecao_id}:
 *   delete:
 *     tags: [Clínicas]
 *     summary: Remover exceção de horário
 *     description: Remove uma exceção de horário específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da clínica
 *       - in: path
 *         name: excecao_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da exceção
 *     responses:
 *       200:
 *         description: Exceção removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Exceção removida com sucesso
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
 *                           example:
 *                             - id: 1
 *                               nome: "Cardiologia"
 *                             - id: 2
 *                               nome: "Dermatologia"
 *                         horarios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/HorarioAtendimento'
 *                           example:
 *                             - dia_semana: 1
 *                               hora_inicio: "08:00"
 *                               hora_fim: "18:00"
 *                             - dia_semana: 2
 *                               hora_inicio: "08:00"
 *                               hora_fim: "18:00"
 */

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
 *                   example:
 *                     id: 1
 *                     nome: "Clínica Premium Atualizada"
 *                     endereco: "Rua das Flores, 456"
 *                     cidade: "São Paulo"
 *                     estado: "SP"
 *                     telefone: "1133335555"
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Especialização adicionada com sucesso
 *                 especializacao:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nome:
 *                       type: string
 *                       example: Cardiologia
 *                     valor_consulta:
 *                       type: number
 *                       example: 250.00
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Especialização removida com sucesso
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Configuração criada com sucesso
 *                 configuracao:
 *                   type: object
 *                   properties:
 *                     especializacao_id:
 *                       type: string
 *                       example: "1"
 *                     dias_semana:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3, 4, 5]
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 *       200:
 *         description: Configuração atualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Configuração atualizada com sucesso
 *                 configuracao:
 *                   type: object
 *                   properties:
 *                     especializacao_id:
 *                       type: string
 *                       example: "1"
 *                     dias_semana:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3, 4, 5]
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configuracoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       especializacao_id:
 *                         type: string
 *                         example: "1"
 *                       dias_semana:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 2, 3, 4, 5]
 *                       hora_inicio:
 *                         type: string
 *                         example: "08:00"
 *                       hora_fim:
 *                         type: string
 *                         example: "18:00"
 */

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
 *           format: uuid
 *         description: ID da clínica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-25"
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               hora_fim:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *     responses:
 *       201:
 *         description: Bloqueio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Bloqueio criado com sucesso
 *                 bloqueio:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       example: "2025-12-25"
 *                     hora_inicio:
 *                       type: string
 *                       example: "08:00"
 *                     hora_fim:
 *                       type: string
 *                       example: "18:00"
 */

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes:
 *   get:
 *     tags: [Clínicas]
 *     summary: Listar exceções de horários
 *     description: Retorna exceções de horários para uma clínica específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da clínica
 *     responses:
 *       200:
 *         description: Lista de exceções de horários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 excecoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       data:
 *                         type: string
 *                         example: "2025-12-25"
 *                       hora_inicio:
 *                         type: string
 *                         example: "08:00"
 *                       hora_fim:
 *                         type: string
 *                         example: "18:00"
 */

/**
 * @swagger
 * /clinicas/{id}/horarios/excecoes/{excecao_id}:
 *   delete:
 *     tags: [Clínicas]
 *     summary: Remover exceção de horário
 *     description: Remove uma exceção de horário específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da clínica
 *       - in: path
 *         name: excecao_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da exceção
 *     responses:
 *       200:
 *         description: Exceção removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Exceção removida com sucesso
 */
export default router;