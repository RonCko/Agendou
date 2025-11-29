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
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
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

/**
 * @swagger
 * /auth/perfil:
 *   put:
 *     tags: [Autenticação]
 *     summary: Atualizar perfil do usuário
 *     description: Atualiza os dados do perfil do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João da Silva Atualizado
 *               telefone:
 *                 type: string
 *                 example: "11988887777"
 *               senha:
 *                 type: string
 *                 format: password
 *                 description: Nova senha (opcional)
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Perfil atualizado com sucesso
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/perfil', verificarToken, AuthController.atualizarPerfil);

export default router;
