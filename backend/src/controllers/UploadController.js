import { Usuario, Clinica } from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
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

  // Remover foto de capa (clínica)
  async removerFotoCapa(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { id } = req.params;

      const clinica = await Clinica.findByPk(id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão
      if (usuario.tipo === 'clinica' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão' });
      }

      // Remover foto se existir
      if (clinica.foto_capa) {
        const filePath = path.join(__dirname, '../../uploads', path.basename(clinica.foto_capa));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        clinica.foto_capa = null;
        await clinica.save();
      }

      return res.status(200).json({
        mensagem: 'Foto de capa removida com sucesso'
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao remover foto' });
    }
  }

  // Buscar foto de capa (clínica)
  async buscarFotoCapa(req, res) {
    try {
      const { id } = req.params;

      const clinica = await Clinica.findByPk(id, {
        attributes: ['id', 'nome_fantasia', 'foto_capa']
      });

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      return res.status(200).json({
        foto_capa: clinica.foto_capa,
        url_completa: clinica.foto_capa ? `${req.protocol}://${req.get('host')}${clinica.foto_capa}` : null
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar foto' });
    }
  }

  // Atualizar foto de capa (PUT - sinônimo do POST)
  async atualizarFotoCapa(req, res) {
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
}

export default new UploadController();
