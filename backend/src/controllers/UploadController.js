import { Usuario, Clinica } from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  // Upload de foto de perfil (usuário)
  async uploadFotoPerfil(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;

      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      const usuarioDb = await Usuario.findByPk(usuario.id);
      if (!usuarioDb) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Remover foto antiga se existir
      if (usuarioDb.foto_perfil) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(usuarioDb.foto_perfil));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Atualizar com nova foto
      const fotoUrl = `/uploads/${req.file.filename}`;
      usuarioDb.foto_perfil = fotoUrl;
      await usuarioDb.save();

      return res.status(200).json({
        mensagem: 'Foto de perfil atualizada com sucesso',
        foto_perfil: fotoUrl
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao fazer upload' });
    }
  }

  // Upload de foto de capa (clínica)
  async uploadFotoCapa(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      const clinica = await Clinica.findByPk(id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão
      if (usuario.tipo === 'clinica' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      // Remover foto antiga se existir
      if (clinica.foto_capa) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(clinica.foto_capa));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Atualizar com nova foto
      const fotoUrl = `/uploads/${req.file.filename}`;
      clinica.foto_capa = fotoUrl;
      await clinica.save();

      return res.status(200).json({
        mensagem: 'Foto de capa atualizada com sucesso',
        foto_capa: fotoUrl
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao fazer upload' });
    }
  }

  // Upload de múltiplas fotos da galeria (clínica)
  async uploadGaleria(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      const clinica = await Clinica.findByPk(id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão
      if (usuario.tipo === 'clinica' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      // Criar URLs das fotos
      const fotosUrls = req.files.map(file => `/uploads/${file.filename}`);

      // Adicionar às fotos existentes (assumindo que há um campo galeria_fotos tipo JSON)
      const galeriaAtual = clinica.galeria_fotos ? JSON.parse(clinica.galeria_fotos) : [];
      clinica.galeria_fotos = JSON.stringify([...galeriaAtual, ...fotosUrls]);
      await clinica.save();

      return res.status(200).json({
        mensagem: `${fotosUrls.length} foto(s) adicionada(s) com sucesso`,
        fotos: fotosUrls
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao fazer upload' });
    }
  }

  // Remover foto da galeria
  async removerFotoGaleria(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { id } = req.params;
      const { foto_url } = req.body;

      const clinica = await Clinica.findByPk(id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão
      if (usuario.tipo === 'clinica' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      const galeriaAtual = clinica.galeria_fotos ? JSON.parse(clinica.galeria_fotos) : [];
      const novaGaleria = galeriaAtual.filter(f => f !== foto_url);

      // Remover arquivo físico
      const filePath = path.join(__dirname, '../../uploads', path.basename(foto_url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      clinica.galeria_fotos = JSON.stringify(novaGaleria);
      await clinica.save();

      return res.status(200).json({
        mensagem: 'Foto removida com sucesso'
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao remover foto' });
    }
  }
}

export default new UploadController();
