import { Clinica, Usuario, ClinicaEspecializacao, Especializacao, HorarioAtendimento, ConfiguracaoHorario, HorarioExcecao, Agendamento } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class ClinicaController {
  // Listar clínicas com filtros avançados (catálogo público)
  async listar(req, res) {
    try {
      const { 
        cidade, 
        estado, 
        especializacao, 
        busca, 
        preco_min, 
        preco_max, 
        ordenar = 'nome', // nome, preco
        pagina = 1, 
        limite = 10,
        usuario_id // Novo: filtro por usuário
      } = req.query;

      const where = { ativo: true };
      
      // Filtro por usuário (para buscar clínica própria)
      if (usuario_id) where.usuario_id = usuario_id;
      const offset = (pagina - 1) * limite;

      // Filtros básicos
      if (cidade) where.cidade = { [Op.iLike]: `%${cidade}%` };
      if (estado) where.estado = estado.toUpperCase();
      if (busca) {
        where[Op.or] = [
          { nome_fantasia: { [Op.iLike]: `%${busca}%` } },
          { descricao: { [Op.iLike]: `%${busca}%` } }
        ];
      }

      const include = [
        {
          association: 'usuario',
          attributes: ['nome', 'telefone', 'foto_perfil']
        },
        {
          association: 'especializacoes',
          attributes: ['id', 'nome'],
          through: { 
            attributes: ['preco', 'duracao_minutos'],
            where: {}
          },
          where: especializacao ? { id: especializacao } : undefined,
          required: especializacao ? true : false
        },
        {
          association: 'horarios',
          where: { ativo: true },
          required: false
        }
      ];

      // Filtro de preço
      if (preco_min || preco_max) {
        const precoWhere = {};
        if (preco_min) precoWhere[Op.gte] = parseFloat(preco_min);
        if (preco_max) precoWhere[Op.lte] = parseFloat(preco_max);
        include[1].through.where.preco = precoWhere;
      }

      // Ordenação
      let order = [];
      switch (ordenar) {
        case 'preco':
          // Ordenar por preço médio das especializações
          order = [[sequelize.literal('"especializacoes->ClinicaEspecializacao"."preco"'), 'ASC']];
          break;
        default:
          order = [['nome_fantasia', 'ASC']];
      }

      const { count, rows: clinicas } = await Clinica.findAndCountAll({ 
        where, 
        include,
        order,
        limit: parseInt(limite),
        offset,
        distinct: true
      });

      return res.status(200).json({ 
        clinicas, 
        total: count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(count / limite)
      });
    } catch (error) {
      console.error('Erro ao listar clínicas:', error);
      return res.status(500).json({ erro: 'Erro ao listar clínicas' });
    }
  }

  // Buscar clínica por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const clinica = await Clinica.findByPk(id, {
        include: [
          { association: 'usuario', attributes: ['nome', 'email', 'telefone', 'foto_perfil'] },
          {
            association: 'especializacoes',
            through: { attributes: ['preco', 'duracao_minutos'] }
          },
          { association: 'horarios', where: { ativo: true }, required: false }
        ]
      });

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      return res.status(200).json({ clinica });
    } catch (error) {
      console.error('Erro ao buscar clínica:', error);
      return res.status(500).json({ erro: 'Erro ao buscar clínica' });
    }
  }

  // Atualizar dados da clínica (apenas a própria clínica)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome_fantasia, descricao, endereco, cidade, estado, cep, telefone_comercial, foto_capa } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode atualizar)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      // Atualizar campos
      if (nome_fantasia) clinica.nome_fantasia = nome_fantasia;
      if (descricao !== undefined) clinica.descricao = descricao;
      if (endereco) clinica.endereco = endereco;
      if (cidade) clinica.cidade = cidade;
      if (estado) clinica.estado = estado;
      if (cep) clinica.cep = cep;
      if (telefone_comercial) clinica.telefone_comercial = telefone_comercial;
      if (foto_capa !== undefined) clinica.foto_capa = foto_capa;

      await clinica.save();

      return res.status(200).json({
        mensagem: 'Clínica atualizada com sucesso',
        clinica
      });
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar clínica' });
    }
  }

  // Adicionar especialização à clínica
  async adicionarEspecializacao(req, res) {
    try {
      const { id } = req.params;
      const { especializacao_id, preco, duracao_minutos } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode adicionar especializações)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      const especializacao = await Especializacao.findByPk(especializacao_id);
      if (!especializacao) {
        return res.status(404).json({ erro: 'Especialização não encontrada' });
      }

      await ClinicaEspecializacao.create({
        clinica_id: id,
        especializacao_id,
        preco,
        duracao_minutos: duracao_minutos || 30,
        ativo: true
      });

      return res.status(201).json({ mensagem: 'Especialização adicionada com sucesso' });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ erro: 'Especialização já cadastrada para esta clínica' });
      }
      console.error('Erro ao adicionar especialização:', error);
      return res.status(500).json({ erro: 'Erro ao adicionar especialização' });
    }
  }

  // Remover especialização da clínica
  async removerEspecializacao(req, res) {
    try {
      const { id, especializacao_id } = req.params;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode remover especializações)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      const removido = await ClinicaEspecializacao.destroy({
        where: {
          clinica_id: id,
          especializacao_id
        }
      });

      if (!removido) {
        return res.status(404).json({ erro: 'Especialização não encontrada' });
      }

      return res.status(200).json({ mensagem: 'Especialização removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover especialização:', error);
      return res.status(500).json({ erro: 'Erro ao remover especialização' });
    }
  }

  // ========== NOVA ARQUITETURA OTIMIZADA ==========

  /**
   * Criar/Atualizar configuração de horários recorrentes
   * Substitui a geração de milhares de slots individuais
   */
  async configurarHorariosRecorrentes(req, res) {
    try {
      const { id } = req.params;
      const { 
        especializacao_id,
        dias_semana, // Array [0-6]
        hora_inicio,
        hora_fim,
        duracao_slot = 30,
        intervalo_almoco = false,
        hora_inicio_almoco,
        hora_fim_almoco,
        data_inicio,
        data_fim
      } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode configurar horários)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      // Validações
      if (!especializacao_id || !dias_semana || !hora_inicio || !hora_fim) {
        return res.status(400).json({ erro: 'Dados incompletos (especializacao_id, dias_semana, hora_inicio, hora_fim são obrigatórios)' });
      }

      // Verificar se a clínica oferece essa especialização
      const clinicaEspec = await ClinicaEspecializacao.findOne({
        where: { clinica_id: id, especializacao_id }
      });

      if (!clinicaEspec) {
        return res.status(400).json({ erro: 'Clínica não oferece esta especialização' });
      }

      // Verificar se já existe configuração para esta especialização
      const configExistente = await ConfiguracaoHorario.findOne({
        where: { clinica_id: id, especializacao_id }
      });

      const dadosConfig = {
        clinica_id: id,
        especializacao_id,
        dias_semana,
        hora_inicio,
        hora_fim,
        duracao_slot: parseInt(duracao_slot),
        intervalo_almoco,
        hora_inicio_almoco: intervalo_almoco ? hora_inicio_almoco : null,
        hora_fim_almoco: intervalo_almoco ? hora_fim_almoco : null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null,
        ativo: true
      };

      let configuracao;

      if (configExistente) {
        // Atualizar configuração existente
        await configExistente.update(dadosConfig);
        configuracao = configExistente;
      } else {
        // Criar nova configuração
        configuracao = await ConfiguracaoHorario.create(dadosConfig);
      }

      // Retornar configuração com especialização
      const configuracaoCompleta = await ConfiguracaoHorario.findByPk(configuracao.id, {
        include: [
          {
            model: Especializacao,
            as: 'especializacao',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(configExistente ? 200 : 201).json({ 
        mensagem: configExistente ? 'Configuração atualizada com sucesso' : 'Configuração criada com sucesso',
        configuracao: configuracaoCompleta
      });
    } catch (error) {
      console.error('Erro ao configurar horários recorrentes:', error);
      return res.status(500).json({ erro: 'Erro ao configurar horários recorrentes', detalhes: error.message });
    }
  }

  /**
   * Listar configurações de horários da clínica
   */
  async listarConfiguracoesHorarios(req, res) {
    try {
      const { id } = req.params;
      const { especializacao_id } = req.query;

      const where = { clinica_id: id, ativo: true };

      if (especializacao_id) {
        where.especializacao_id = especializacao_id;
      }

      const configuracoes = await ConfiguracaoHorario.findAll({
        where,
        include: [
          {
            model: Especializacao,
            as: 'especializacao',
            attributes: ['id', 'nome']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({ configuracoes });
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      return res.status(500).json({ erro: 'Erro ao listar configurações' });
    }
  }

  /**
   * Bloquear horários específicos (exceções)
   * Usado para feriados, bloqueios pontuais, etc.
   */
  async bloquearHorarios(req, res) {
    try {
      const { id } = req.params;
      const { 
        especializacao_id,
        data_excecao,
        hora_inicio,
        hora_fim,
        tipo = 'bloqueio', // bloqueio, feriado, evento, customizado
        motivo
      } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode bloquear horários)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      // Validações
      if (!especializacao_id || !data_excecao) {
        return res.status(400).json({ erro: 'especializacao_id e data_excecao são obrigatórios' });
      }

      // Criar exceção (se não informar horários, bloqueia dia inteiro)
      const excecao = await HorarioExcecao.create({
        clinica_id: id,
        especializacao_id,
        data_excecao,
        hora_inicio: hora_inicio || '00:00',
        hora_fim: hora_fim || '23:59',
        tipo,
        motivo: motivo || null
      });

      // Retornar exceção com especialização
      const excecaoCompleta = await HorarioExcecao.findByPk(excecao.id, {
        include: [
          {
            model: Especializacao,
            as: 'especializacao',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(201).json({ 
        mensagem: 'Horário bloqueado com sucesso',
        excecao: excecaoCompleta
      });
    } catch (error) {
      console.error('Erro ao bloquear horários:', error);
      return res.status(500).json({ erro: 'Erro ao bloquear horários', detalhes: error.message });
    }
  }

  /**
   * Listar exceções (bloqueios) de horários
   */
  async listarExcecoes(req, res) {
    try {
      const { id } = req.params;
      const { especializacao_id, data_inicio, data_fim } = req.query;

      const where = { clinica_id: id };

      if (especializacao_id) {
        where.especializacao_id = especializacao_id;
      }

      if (data_inicio || data_fim) {
        where.data_excecao = {};
        if (data_inicio) where.data_excecao[Op.gte] = data_inicio;
        if (data_fim) where.data_excecao[Op.lte] = data_fim;
      }

      const excecoes = await HorarioExcecao.findAll({
        where,
        include: [
          {
            model: Especializacao,
            as: 'especializacao',
            attributes: ['id', 'nome']
          }
        ],
        order: [['data_excecao', 'ASC']]
      });

      return res.status(200).json({ excecoes });
    } catch (error) {
      console.error('Erro ao listar exceções:', error);
      return res.status(500).json({ erro: 'Erro ao listar exceções' });
    }
  }

  /**
   * Remover exceção (desbloquear)
   */
  async removerExcecao(req, res) {
    try {
      const { id, excecao_id } = req.params;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar propriedade (apenas o dono da clínica pode remover exceções)
      if (clinica.usuario_id !== req.usuarioId) {
        return res.status(403).json({ erro: 'Não autorizado' });
      }

      const removido = await HorarioExcecao.destroy({
        where: { id: excecao_id, clinica_id: id }
      });

      if (!removido) {
        return res.status(404).json({ erro: 'Exceção não encontrada' });
      }

      return res.status(200).json({ mensagem: 'Exceção removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover exceção:', error);
      return res.status(500).json({ erro: 'Erro ao remover exceção' });
    }
  }

}

export default new ClinicaController();
