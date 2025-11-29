import { Clinica, Usuario, ClinicaEspecializacao, Especializacao, HorarioAtendimento} from '../models/index.js';
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
          attributes: ['id', 'nome', 'icone'],
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

  // Atualizar dados da clínica (apenas a própria clínica ou admin)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;
      const { nome_fantasia, descricao, endereco, cidade, estado, cep, telefone_comercial, foto_capa } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão (admin pode tudo, clinica só a própria)
      if (usuario.tipo !== 'admin' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão para alterar esta clínica' });
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
      const usuario = req.usuario || req.usuarioSessao;
      const { especializacao_id, preco, duracao_minutos } = req.body;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão (admin pode tudo, clinica só a própria)
      if (usuario.tipo !== 'admin' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão para alterar esta clínica' });
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
      const usuario = req.usuario || req.usuarioSessao;

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão (admin pode tudo, clinica só a própria)
      if (usuario.tipo !== 'admin' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão para alterar esta clínica' });
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

  // Configurar horários de atendimento
  async configurarHorarios(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;
      const { horarios } = req.body; // Array de { dia_semana, hora_inicio, hora_fim }

      const clinica = await Clinica.findByPk(id);

      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      // Verificar permissão (admin pode tudo, clinica só a própria)
      if (usuario.tipo !== 'admin' && clinica.usuario_id !== usuario.id) {
        return res.status(403).json({ erro: 'Sem permissão para alterar esta clínica' });
      }

      // Remover horários antigos
      await HorarioAtendimento.destroy({ where: { clinica_id: id } });

      // Criar novos horários
      const horariosParaCriar = horarios.map(h => ({
        clinica_id: id,
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
        ativo: true
      }));

      await HorarioAtendimento.bulkCreate(horariosParaCriar);

      return res.status(200).json({ mensagem: 'Horários configurados com sucesso' });
    } catch (error) {
      console.error('Erro ao configurar horários:', error);
      return res.status(500).json({ erro: 'Erro ao configurar horários' });
    }
  }
}

export default new ClinicaController();
