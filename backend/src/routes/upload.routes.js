import express from 'express';
import UploadController from '../controllers/UploadController.js';
import upload from '../config/upload.js';
import { verificarToken, estaLogado, eClinica } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   post:
 *     tags: [Upload]
 *     summary: Upload de foto de capa da clínica
 *     description: |
 *       Faz upload da foto de capa/destaque da clínica.
 *       
 *       **Acesso:** Apenas a própria clínica 
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
router.post('/clinica/:id/capa', [verificarToken, estaLogado, eClinica], upload.single('foto'), UploadController.uploadFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   get:
 *     tags: [Upload]
 *     summary: Buscar foto de capa da clínica
 *     description: |
 *       Retorna a URL da foto de capa da clínica.
 *       
 *       **Acesso:** Público
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *     responses:
 *       200:
 *         description: URL da foto de capa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 foto_capa:
 *                   type: string
 *                   example: /uploads/foto-123.jpg
 *                 url_completa:
 *                   type: string
 *                   example: http://localhost:3333/uploads/foto-123.jpg
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/clinica/:id/capa', UploadController.buscarFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   put:
 *     tags: [Upload]
 *     summary: Atualizar foto de capa da clínica
 *     description: |
 *       Atualiza a foto de capa da clínica, removendo a anterior.
 *       
 *       **Acesso:** Apenas a própria clínica  
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
 *                 description: Arquivo de imagem (JPG, JPEG, PNG)
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
 *                 foto_capa:
 *                   type: string
 *                   example: /uploads/foto-123.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/clinica/:id/capa', [verificarToken, estaLogado, eClinica], upload.single('foto'), UploadController.uploadFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   get:
 *     tags: [Upload]
 *     summary: Buscar foto de capa da clínica
 *     description: |
 *       Retorna a URL da foto de capa da clínica.
 *       
 *       **Acesso:** Público
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *     responses:
 *       200:
 *         description: URL da foto de capa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 foto_capa:
 *                   type: string
 *                   example: /uploads/foto-123.jpg
 *                 url_completa:
 *                   type: string
 *                   example: http://localhost:3333/uploads/foto-123.jpg
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/clinica/:id/capa', UploadController.buscarFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   put:
 *     tags: [Upload]
 *     summary: Atualizar foto de capa da clínica
 *     description: |
 *       Atualiza a foto de capa da clínica, removendo a anterior.
 *       
 *       **Acesso:** Apenas a própria clínica  
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
 *                 description: Arquivo de imagem (JPG, JPEG, PNG)
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
 *                 foto_capa:
 *                   type: string
 *                   example: /uploads/foto-123.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/clinica/:id/capa', [verificarToken, estaLogado, eClinica], upload.single('foto'), UploadController.atualizarFotoCapa);

/**
 * @swagger
 * /upload/clinica/{id}/capa:
 *   delete:
 *     tags: [Upload]
 *     summary: Remover foto de capa da clínica
 *     description: |
 *       Remove a foto de capa da clínica.
 *       
 *       **Acesso:** Apenas a própria clínica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da clínica
 *     responses:
 *       200:
 *         description: Foto de capa removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Foto de capa removida com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/clinica/:id/capa', [verificarToken, estaLogado, eClinica], UploadController.removerFotoCapa);

export default router;
