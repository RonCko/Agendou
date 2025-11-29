import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { verificarToken, estaLogado } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/registrar', AuthController.registrar);
router.post('/login', AuthController.login);

// Rotas protegidas
router.post('/logout', estaLogado, AuthController.logout);
router.get('/perfil', verificarToken, AuthController.perfil);
router.put('/perfil', verificarToken, AuthController.atualizarPerfil);

export default router;
