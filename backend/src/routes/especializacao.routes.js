import express from 'express';
import { Especializacao } from '../models/index.js';

const router = express.Router();

/**
 * @swagger
 * /especializacoes:
 *   get:
 *     tags: [Especializações]
 *     summary: Listar todas as especializações
 *     description: Retorna lista de todas as especializações médicas ativas disponíveis no sistema
 *     responses:
 *       200:
 *         description: Lista de especializações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 especializacoes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Especializacao'
 *             example:
 *               especializacoes:
 *                 - id: 1
 *                   nome: Cardiologia
 *                   descricao: Especialidade médica dedicada ao coração
 *                   ativo: true
 *                 - id: 2
 *                   nome: Dermatologia
 *                   descricao: Especialidade médica dedicada à pele
 *                   ativo: true
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', async (req, res) => {
  try {
    const especializacoes = await Especializacao.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    return res.status(200).json({ especializacoes });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar especializações' });
  }
});

export default router;
