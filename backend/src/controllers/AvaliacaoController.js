import { Avaliacao, Paciente, Clinica, Usuario } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Controlador de avaliações com 4 ações: criar, listarPorClinica, atualizar, deletar.
 * Usa modelos Sequelize: Avaliacao, Paciente, Clinica; inclui relacionamentos para retornar dados do paciente/usuário e clínica.
 *
 * @class AvaliacaoController
 */
class AvaliacaoController {
  /**
   * Entrada: clinica_id, nota, comentario, usuário obtido de req.usuario/req.usuarioSessao.
   * Validações: campos obrigatórios, nota entre 1-5, só paciente pode criar.
   * Verifica existência do paciente e clínica.
   * Verifica se avaliação já existe (um por paciente/clínica).
   * Cria avaliação e retorna com dados do paciente/usuário e clínica; captura erros.
   * POST /api/avaliacoes
   */
  async criar(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { clinica_id, nota, comentario } = req.body;

      if (!clinica_id || !nota) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios faltando',
          mensagem: 'clinica_id e nota são obrigatórios'
        });
      }

      if (nota < 1 || nota > 5) {
        return res.status(400).json({ 
          erro: 'Nota inválida',
          mensagem: 'A nota deve ser entre 1 e 5'
        });
      }

      if (usuario.tipo !== 'paciente') {
        return res.status(403).json({ 
          erro: 'Acesso negado',
          mensagem: 'Apenas pacientes podem avaliar clínicas'
        });
      }

      const paciente = await Paciente.findOne({ 
        where: { usuario_id: usuario.id } 
      });

      if (!paciente) {
        return res.status(404).json({ erro: 'Paciente não encontrado' });
      }

      const clinica = await Clinica.findByPk(clinica_id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      const avaliacaoExistente = await Avaliacao.findOne({
        where: {
          clinica_id,
          paciente_id: paciente.id
        }
      });

      if (avaliacaoExistente) {
        return res.status(409).json({ 
          erro: 'Avaliação já existe',
          mensagem: 'Você já avaliou esta clínica. Use PUT para atualizar.'
        });
      }

      const avaliacao = await Avaliacao.create({
        clinica_id,
        paciente_id: paciente.id,
        nota,
        comentario
      });

      const avaliacaoCriada = await Avaliacao.findByPk(avaliacao.id, {
        include: [
          {
            association: 'paciente',
            include: [{
              association: 'usuario',
              attributes: ['nome', 'foto_perfil']
            }]
          },
          {
            association: 'clinica',
            attributes: ['nome_fantasia']
          }
        ]
      });

      return res.status(201).json({
        mensagem: 'Avaliação criada com sucesso',
        avaliacao: avaliacaoCriada
      });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          erro: 'Você já avaliou esta clínica'
        });
      }
      
      return res.status(500).json({ erro: 'Erro ao criar avaliação' });
    }
  }

  /**
   * Entrada: clinica_id, usuário obtido de req.usuario/req.usuarioSessao.
   * Validações: campos obrigatórios, só clínica pode listar.
   * Verifica existência clínica.
   * Lista avaliações com dados do paciente/usuário, ordenadas por data (desc).
   * Retorna lista; captura erros.
   * GET /api/avaliacoes/clinica/:clinica_id
   */
  async listarPorClinica(req, res) {
    try {
      const { clinica_id } = req.params;

      const avaliacoes = await Avaliacao.findAll({
        where: { clinica_id },
        include: [
          {
            association: 'paciente',
            include: [{
              association: 'usuario',
              attributes: ['nome', 'foto_perfil']
            }]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({ avaliacoes });
    } catch (error) {
      console.error('Erro ao listar avaliações:', error);
      return res.status(500).json({ erro: 'Erro ao listar avaliações' });
    }
  }

  /**
   * Entrada: id (avaliação), nota, comentario, usuário obtido de req.usuario/req.usuarioSessao.
   * Validações: campos obrigatórios, nota entre 1-5, só autor pode atualizar.
   * Verifica existência avaliação.
   * Atualiza avaliação e retorna com dados do paciente/usuário e clínica;
   * captura erros.
   * PUT /api/avaliacoes/:id
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;
      const { nota, comentario } = req.body;

      const avaliacao = await Avaliacao.findByPk(id, {
        include: [{
          association: 'paciente',
          include: [{ association: 'usuario' }]
        }]
      });

      if (!avaliacao) {
        return res.status(404).json({ erro: 'Avaliação não encontrada' });
      }

      if (avaliacao.paciente.usuario_id !== usuario.id) {
        return res.status(403).json({ 
          erro: 'Acesso negado',
          mensagem: 'Você só pode editar suas próprias avaliações'
        });
      }

      if (nota && (nota < 1 || nota > 5)) {
        return res.status(400).json({ 
          erro: 'Nota inválida',
          mensagem: 'A nota deve ser entre 1 e 5'
        });
      }

      if (nota) avaliacao.nota = nota;
      if (comentario !== undefined) avaliacao.comentario = comentario;
      
      await avaliacao.save();

      return res.status(200).json({
        mensagem: 'Avaliação atualizada com sucesso',
        avaliacao
      });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar avaliação' });
    }
  }

  /**
   * Entrada: id (avaliação), usuário obtido de req.usuario/req.usuarioSessao.
   * Validações: só autor pode deletar.
   * Verifica existência avaliação.
   * Deleta avaliação e retorna sucesso;
   * captura erros.
   * DELETE /api/avaliacoes/:id
   */
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;

      const avaliacao = await Avaliacao.findByPk(id, {
        include: [{
          association: 'paciente',
          include: [{ association: 'usuario' }]
        }]
      });

      if (!avaliacao) {
        return res.status(404).json({ erro: 'Avaliação não encontrada' });
      }

      if (avaliacao.paciente.usuario_id !== usuario.id) {
        return res.status(403).json({ 
          erro: 'Acesso negado',
          mensagem: 'Você só pode deletar suas próprias avaliações'
        });
      }

      await avaliacao.destroy();

      return res.status(200).json({ 
        mensagem: 'Avaliação deletada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      return res.status(500).json({ erro: 'Erro ao deletar avaliação' });
    }
  }
}

  /**
   * @export AvaliacaoController instancia única do controlador de avaliações.
   */
export default new AvaliacaoController();