import { Router } from 'express';
import AvaliacaoController from '../controllers/AvaliacaoController.js';
import { verificarToken, ePaciente } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/avaliacoes:
 *   post:
 *     summary: Criar nova avaliação
 *     tags: [Avaliações]
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
 *               - nota
 *             properties:
 *               clinica_id:
 *                 type: string
 *                 format: uuid
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avaliação criada
 *       409:
 *         description: Você já avaliou esta clínica
 */
router.post('/', verificarToken, ePaciente, AvaliacaoController.criar);

/**
 * @swagger
 * /api/avaliacoes/clinica/{clinica_id}:
 *   get:
 *     summary: Listar avaliações de uma clínica
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: clinica_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de avaliações
 */
router.get('/clinica/:clinica_id', AvaliacaoController.listarPorClinica);


/**
 * @swagger
 * /api/avaliacoes/{id}:
 *   put:
 *     summary: Atualizar avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nota:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avaliação atualizada
 */
router.put('/:id', verificarToken, AvaliacaoController.atualizar);

/**
 * @swagger
 * /api/avaliacoes/{id}:
 *   delete:
 *     summary: Deletar avaliação
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Avaliação deletada
 */
router.delete('/:id', verificarToken, AvaliacaoController.deletar);

export default router;