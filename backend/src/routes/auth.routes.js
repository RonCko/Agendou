import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { verificarToken, estaLogado } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário (paciente ou clínica) no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - tipo
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário ou da clínica
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único do usuário
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Senha (mínimo 6 caracteres)
 *                 example: senha123
 *               tipo:
 *                 type: string
 *                 enum: [paciente, clinica]
 *                 description: Tipo de usuário
 *                 example: paciente
 *               cpf:
 *                 type: string
 *                 description: CPF (obrigatório para paciente)
 *                 example: "12345678900"
 *               telefone:
 *                 type: string
 *                 description: Telefone do paciente
 *                 example: "11999998888"
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento (obrigatório para paciente)
 *                 example: "1990-01-15"
 *               cnpj:
 *                 type: string
 *                 description: CNPJ (obrigatório para clínica)
 *                 example: "12345678000199"
 *               endereco:
 *                 type: string
 *                 description: Endereço completo (obrigatório para clínica)
 *                 example: "Rua das Flores, 123"
 *               cidade:
 *                 type: string
 *                 description: Cidade (obrigatório para clínica)
 *                 example: São Paulo
 *               estado:
 *                 type: string
 *                 description: Estado (obrigatório para clínica)
 *                 example: SP
 *               telefone_clinica:
 *                 type: string
 *                 description: Telefone da clínica
 *                 example: "1133334444"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário registrado com sucesso
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 */
router.post('/registrar', AuthController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                 usuario:
 *                   type: object
 *                   description: Dados completos do usuário (inclui 'paciente' OU 'clinica' conforme o tipo)
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                       enum: [paciente, clinica]
 *                     telefone:
 *                       type: string
 *                     foto_perfil:
 *                       type: string
 *                       nullable: true
 *                     ativo:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     paciente:
 *                       type: object
 *                       description: Presente apenas se tipo = 'paciente'
 *                       properties:
 *                         id:
 *                           type: integer
 *                         cpf:
 *                           type: string
 *                         data_nascimento:
 *                           type: string
 *                           format: date
 *                         endereco:
 *                           type: string
 *                     clinica:
 *                       type: object
 *                       description: Presente apenas se tipo = 'clinica'
 *                       properties:
 *                         id:
 *                           type: integer
 *                         cnpj:
 *                           type: string
 *                         nome_fantasia:
 *                           type: string
 *                         descricao:
 *                           type: string
 *                         endereco:
 *                           type: string
 *                         cidade:
 *                           type: string
 *                         estado:
 *                           type: string
 *                         cep:
 *                           type: string
 *                         telefone_comercial:
 *                           type: string
 *                         foto_capa:
 *                           type: string
 *                           nullable: true
 *                         ativo:
 *                           type: boolean
 *                         especializacoes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               nome:
 *                                 type: string
 *             examples:
 *               paciente:
 *                 summary: Login de Paciente
 *                 value:
 *                   mensagem: Login realizado com sucesso
 *                   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidGlwbyI6InBhY2llbnRlIiwiaWF0IjoxNzMzMDc4NDAwLCJleHAiOjE3MzMxNjQ4MDB9.example
 *                   usuario:
 *                     id: 2
 *                     nome: Eduardo Silva
 *                     email: edudu29@hotmail.com.br
 *                     tipo: paciente
 *                     telefone: "11987654321"
 *                     foto_perfil: null
 *                     ativo: true
 *                     createdAt: "2025-12-01T10:30:00.000Z"
 *                     updatedAt: "2025-12-01T10:30:00.000Z"
 *                     paciente:
 *                       id: 2
 *                       cpf: "12345678900"
 *                       data_nascimento: "1995-05-20"
 *                       endereco: "Rua das Acácias, 456"
 *               clinica:
 *                 summary: Login de Clínica
 *                 value:
 *                   mensagem: Login realizado com sucesso
 *                   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidGlwbyI6ImNsaW5pY2EiLCJpYXQiOjE3MzMwNzg0MDAsImV4cCI6MTczMzE2NDgwMH0.example
 *                   usuario:
 *                     id: 1
 *                     nome: Clínica Vida Saudável
 *                     email: contato@vidasaudavel.com.br
 *                     tipo: clinica
 *                     telefone: "1133334444"
 *                     foto_perfil: null
 *                     ativo: true
 *                     createdAt: "2025-11-28T08:00:00.000Z"
 *                     updatedAt: "2025-11-28T08:00:00.000Z"
 *                     clinica:
 *                       id: 1
 *                       cnpj: "12345678000199"
 *                       nome_fantasia: Clínica Vida Saudável
 *                       descricao: Clínica especializada em saúde integral com equipe multidisciplinar
 *                       endereco: Av. Paulista, 1000 - Sala 505
 *                       cidade: São Paulo
 *                       estado: SP
 *                       cep: "01310-100"
 *                       telefone_comercial: "1133334444"
 *                       foto_capa: /uploads/capa-clinica1.jpg
 *                       ativo: true
 *                       especializacoes:
 *                         - id: 1
 *                           nome: Cardiologia
 *                         - id: 3
 *                           nome: Dermatologia
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Autenticação]
 *     summary: Fazer logout
 *     description: Encerra a sessão do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', estaLogado, AuthController.logout);

/**
 * @swagger
 * /auth/perfil:
 *   get:
 *     tags: [Autenticação]
 *     summary: Buscar perfil do usuário
 *     description: Retorna os dados do perfil do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/perfil', verificarToken, AuthController.perfil);

export default router;
