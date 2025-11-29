import express from 'express';
import UploadController from '../controllers/UploadController.js';
import upload from '../config/upload.js';
import { verificarToken, estaLogado, eClinicaOuAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Upload de foto de perfil (qualquer usuário logado)
router.post('/perfil', [verificarToken, estaLogado], upload.single('foto'), UploadController.uploadFotoPerfil);

// Upload de foto de capa da clínica
router.post('/clinica/:id/capa', [verificarToken, estaLogado, eClinicaOuAdmin], upload.single('foto'), UploadController.uploadFotoCapa);

// Upload de fotos da galeria (múltiplas)
router.post('/clinica/:id/galeria', [verificarToken, estaLogado, eClinicaOuAdmin], upload.array('fotos', 10), UploadController.uploadGaleria);

// Remover foto da galeria
router.delete('/clinica/:id/galeria', [verificarToken, estaLogado, eClinicaOuAdmin], UploadController.removerFotoGaleria);

export default router;
