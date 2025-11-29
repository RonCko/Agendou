import express from 'express';
import { Especializacao } from '../models/index.js';

const router = express.Router();

// Listar todas as especializações
router.get('/', async (req, res) => {
  try {
    const especializacoes = await Especializacao.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    return res.status(200).json({ especializacoes });
  } catch (error) {
    console.error('Erro ao listar especializações:', error);
    return res.status(500).json({ erro: 'Erro ao listar especializações' });
  }
});

export default router;
