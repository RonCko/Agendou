import express from 'express';
import UploadController from '../controllers/UploadController.js';
import upload from '../config/upload.js';
import { verificarToken, estaLogado, eClinicaOuAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /upload/perfil:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto de perfil
 *     description: |
 *       Faz upload de uma foto de perfil do usuário.
 *       
 *       **Formatos aceitos:** JPG, JPEG, PNG  
 *       **Tamanho máximo:** 5MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - foto
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem (JPG, JPEG, PNG)
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Upload realizado com sucesso
 *                 url:
 *                   type: string
 *                   example: http://localhost:3333/uploads/1234567890-foto.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/perfil', [verificarToken, estaLogado], upload.single('foto'), UploadController.uploadFotoPerfil);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto de capa da clínica
 *     description: |
 *       Faz upload da foto de capa/destaque da clínica.
 *       
 *       **Acesso:** Apenas a própria clínica ou admin  
 *       **Formatos aceitos:** JPG, JPEG, PNG  
 *       **Tamanho máximo:** 5MB
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - foto
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem
 *     responses:
 *       200:
 *         description: Foto de capa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Foto de capa atualizada com sucesso
 *                 url:
 *                   type: string
 *                   example: http://localhost:3333/uploads/clinica-capa.jpg
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/clinica/:id/capa', [verificarToken, estaLogado, eClinicaOuAdmin], upload.single('foto'), UploadController.uploadFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/galeria:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de fotos para galeria da clínica
 *     description: |
 *       Faz upload de múltiplas fotos para a galeria da clínica.
 *       
 *       **Acesso:** Apenas a própria clínica ou admin  
 *       **Máximo:** 10 fotos por vez  
 *       **Formatos aceitos:** JPG, JPEG, PNG  
 *       **Tamanho máximo:** 5MB por foto
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fotos
 *             properties:
 *               fotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Múltiplos arquivos de imagem (máx. 10)
 *     responses:
 *       200:
 *         description: Fotos adicionadas à galeria com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Fotos adicionadas com sucesso
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/clinica/:id/galeria', [verificarToken, estaLogado, eClinicaOuAdmin], upload.array('fotos', 10), UploadController.uploadGaleria);

/**
 * @swagger
 * /upload/clinica/{id}/galeria:
 *   delete:
 *     tags: [Upload]
 *     summary: Remover foto da galeria
 *     description: Remove uma foto específica da galeria da clínica
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
 *               - foto_url
 *             properties:
 *               foto_url:
 *                 type: string
 *                 description: URL da foto a ser removida
 *                 example: http://localhost:3333/uploads/foto.jpg
 *     responses:
 *       200:
 *         description: Foto removida com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/clinica/:id/galeria', [verificarToken, estaLogado, eClinicaOuAdmin], UploadController.removerFotoGaleria);

export default router;
