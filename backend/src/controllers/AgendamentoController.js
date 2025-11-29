import { Agendamento, Paciente, Clinica, Especializacao, Usuario, HorarioAtendimento } from '../models/index.js';
import { Op } from 'sequelize';

class AgendamentoController {
  // Listar todos os agendamentos (filtrado por perfil)
  async listar(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { status, data_agendamento } = req.query;

      const where = {};
      
      // Filtros opcionais
      if (status) where.status = status;
      if (data_agendamento) where.data_agendamento = data_agendamento;

      // Se for paciente, mostrar apenas seus agendamentos
      if (usuario.tipo === 'paciente') {
        const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
        if (!paciente) {
          return res.status(404).json({ erro: 'Paciente não encontrado' });
        }
        where.paciente_id = paciente.id;
      }

      // Se for clínica, mostrar apenas agendamentos da sua clínica
      if (usuario.tipo === 'clinica') {
        const clinica = await Clinica.findOne({ where: { usuario_id: usuario.id } });
        if (!clinica) {
          return res.status(404).json({ erro: 'Clínica não encontrada' });
        }
        where.clinica_id = clinica.id;
      }

      const agendamentos = await Agendamento.findAll({
        where,
        include: [
          {
            association: 'paciente',
            include: [{ association: 'usuario', attributes: ['nome', 'email', 'telefone'] }]
          },
          {
            association: 'clinica',
            include: [{ association: 'usuario', attributes: ['nome'] }],
            attributes: ['nome_fantasia', 'endereco', 'cidade', 'telefone_comercial']
          },
          {
            association: 'especializacao',
            attributes: ['nome', 'icone']
          }
        ],
        order: [['data_agendamento', 'ASC'], ['hora_agendamento', 'ASC']]
      });

      return res.status(200).json({ agendamentos });
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      return res.status(500).json({ erro: 'Erro ao listar agendamentos' });
    }
  }

  // Buscar agendamento por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;

      const agendamento = await Agendamento.findByPk(id, {
        include: [
          {
            association: 'paciente',
            include: [{ association: 'usuario', attributes: ['nome', 'email', 'telefone'] }]
          },
          {
            association: 'clinica',
            include: [{ association: 'usuario', attributes: ['nome'] }]
          },
          {
            association: 'especializacao'
          }
        ]
      });

      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }

      // Verificar permissões
      if (usuario.tipo === 'paciente') {
        const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.paciente_id !== paciente.id) {
          return res.status(403).json({ erro: 'Sem permissão para ver este agendamento' });
        }
      }

      if (usuario.tipo === 'clinica') {
        const clinica = await Clinica.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.clinica_id !== clinica.id) {
          return res.status(403).json({ erro: 'Sem permissão para ver este agendamento' });
        }
      }

      return res.status(200).json({ agendamento });
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      return res.status(500).json({ erro: 'Erro ao buscar agendamento' });
    }
  }

  // Criar novo agendamento (com regra de negócio)
  async criar(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;
      const { clinica_id, especializacao_id, data_agendamento, hora_agendamento, observacoes } = req.body;

      // Validações básicas
      if (!clinica_id || !especializacao_id || !data_agendamento || !hora_agendamento) {
        return res.status(400).json({ 
          erro: 'Campos obrigatórios faltando',
          mensagem: 'Clínica, especialização, data e hora são obrigatórios'
        });
      }

      // Buscar o paciente do usuário logado
      let paciente_id;
      if (usuario.tipo === 'paciente') {
        const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
        if (!paciente) {
          return res.status(404).json({ erro: 'Paciente não encontrado' });
        }
        paciente_id = paciente.id;
      } else if (usuario.tipo === 'admin' && req.body.paciente_id) {
        // Admin pode criar para qualquer paciente
        paciente_id = req.body.paciente_id;
      } else {
        return res.status(403).json({ erro: 'Apenas pacientes podem criar agendamentos' });
      }

      // Verificar se clínica existe e está ativa
      const clinica = await Clinica.findByPk(clinica_id);
      if (!clinica || !clinica.ativo) {
        return res.status(400).json({ erro: 'Clínica não encontrada ou inativa' });
      }

      // Verificar se especialização existe
      const especializacao = await Especializacao.findByPk(especializacao_id);
      if (!especializacao || !especializacao.ativo) {
        return res.status(400).json({ erro: 'Especialização não encontrada ou inativa' });
      }

      // ========================================
      // REGRA DE NEGÓCIO: Verificar se já existe agendamento no mesmo horário
      // ========================================
      const agendamentoExistente = await Agendamento.findOne({
        where: {
          clinica_id,
          especializacao_id,
          data_agendamento,
          hora_agendamento,
          status: {
            [Op.notIn]: ['cancelado'] // Ignorar agendamentos cancelados
          }
        }
      });

      if (agendamentoExistente) {
        return res.status(409).json({ 
          erro: 'Horário indisponível',
          mensagem: 'Já existe um agendamento para este horário e especialização nesta clínica',
          conflito: {
            data: agendamentoExistente.data_agendamento,
            hora: agendamentoExistente.hora_agendamento
          }
        });
      }

      // Verificar se a data e hora não são no passado
      const [hora, minuto] = hora_agendamento.split(':');
      
      // Criar data com fuso horário local (Brasil)
      const [ano, mes, dia] = data_agendamento.split('-');
      const dataHoraAgendamento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), parseInt(hora), parseInt(minuto), 0);
      
      const agora = new Date();

      if (dataHoraAgendamento < agora) {
        return res.status(400).json({ 
          erro: 'Data inválida',
          mensagem: 'Não é possível agendar para datas e horários passados'
        });
      }

      // Criar agendamento
      const agendamento = await Agendamento.create({
        paciente_id,
        clinica_id,
        especializacao_id,
        data_agendamento,
        hora_agendamento,
        status: 'pendente',
        observacoes
      });

      // Buscar agendamento criado com relacionamentos
      const agendamentoCriado = await Agendamento.findByPk(agendamento.id, {
        include: [
          {
            association: 'paciente',
            include: [{ association: 'usuario', attributes: ['nome', 'email'] }]
          },
          {
            association: 'clinica',
            attributes: ['nome_fantasia', 'endereco']
          },
          {
            association: 'especializacao',
            attributes: ['nome', 'icone']
          }
        ]
      });

      return res.status(201).json({
        mensagem: 'Agendamento criado com sucesso',
        agendamento: agendamentoCriado
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      
      // Tratamento especial para erro de constraint unique
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          erro: 'Horário indisponível',
          mensagem: 'Este horário já está ocupado'
        });
      }

      return res.status(500).json({ 
        erro: 'Erro ao criar agendamento',
        mensagem: error.message
      });
    }
  }

  // Atualizar agendamento (status, observações)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;
      const { status, medico_nome, observacoes } = req.body;

      const agendamento = await Agendamento.findByPk(id);

      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }

      // Verificar permissões
      if (usuario.tipo === 'paciente') {
        const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.paciente_id !== paciente.id) {
          return res.status(403).json({ erro: 'Sem permissão para alterar este agendamento' });
        }
        // Paciente só pode cancelar
        if (status && status !== 'cancelado') {
          return res.status(403).json({ erro: 'Paciente só pode cancelar agendamentos' });
        }
      }

      if (usuario.tipo === 'clinica') {
        const clinica = await Clinica.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.clinica_id !== clinica.id) {
          return res.status(403).json({ erro: 'Sem permissão para alterar este agendamento' });
        }
      }

      // Atualizar campos permitidos
      if (status) agendamento.status = status;
      if (medico_nome !== undefined) agendamento.medico_nome = medico_nome;
      if (observacoes !== undefined) agendamento.observacoes = observacoes;

      await agendamento.save();

      const agendamentoAtualizado = await Agendamento.findByPk(id, {
        include: [
          {
            association: 'paciente',
            include: [{ association: 'usuario', attributes: ['nome'] }]
          },
          {
            association: 'clinica',
            attributes: ['nome_fantasia']
          },
          {
            association: 'especializacao',
            attributes: ['nome']
          }
        ]
      });

      return res.status(200).json({
        mensagem: 'Agendamento atualizado com sucesso',
        agendamento: agendamentoAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
    }
  }

  // Deletar agendamento
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario || req.usuarioSessao;

      const agendamento = await Agendamento.findByPk(id);

      if (!agendamento) {
        return res.status(404).json({ erro: 'Agendamento não encontrado' });
      }

      // Verificar permissões
      if (usuario.tipo === 'paciente') {
        const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.paciente_id !== paciente.id) {
          return res.status(403).json({ erro: 'Sem permissão para deletar este agendamento' });
        }
      }

      if (usuario.tipo === 'clinica') {
        const clinica = await Clinica.findOne({ where: { usuario_id: usuario.id } });
        if (agendamento.clinica_id !== clinica.id) {
          return res.status(403).json({ erro: 'Sem permissão para deletar este agendamento' });
        }
      }

      await agendamento.destroy();

      return res.status(200).json({ mensagem: 'Agendamento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      return res.status(500).json({ erro: 'Erro ao deletar agendamento' });
    }
  }

  // Verificar disponibilidade de horários
  async verificarDisponibilidade(req, res) {
    try {
      const { clinica_id, especializacao_id, data_agendamento } = req.query;

      if (!clinica_id || !especializacao_id || !data_agendamento) {
        return res.status(400).json({ 
          erro: 'Parâmetros faltando',
          mensagem: 'clinica_id, especializacao_id e data_agendamento são obrigatórios'
        });
      }

      // Buscar slots disponíveis para essa clínica, especialização e data
      const slotsDisponiveis = await HorarioAtendimento.findAll({
        where: {
          clinica_id,
          especializacao_id,
          data_disponivel: data_agendamento,
          ativo: true
        },
        attributes: ['id', 'hora_inicio', 'hora_fim'],
        order: [['hora_inicio', 'ASC']]
      });

      // Buscar agendamentos já existentes para essa combinação
      const agendamentosOcupados = await Agendamento.findAll({
        where: {
          clinica_id,
          especializacao_id,
          data_agendamento,
          status: {
            [Op.notIn]: ['cancelado']
          }
        },
        attributes: ['hora_agendamento'],
        order: [['hora_agendamento', 'ASC']]
      });

      const horariosOcupados = agendamentosOcupados.map(a => a.hora_agendamento);

      // Filtrar slots que ainda não foram agendados
      const horariosDisponiveis = slotsDisponiveis
        .filter(slot => !horariosOcupados.includes(slot.hora_inicio))
        .map(slot => slot.hora_inicio);

      return res.status(200).json({ 
        horariosDisponiveis,
        horariosOcupados,
        total_disponiveis: horariosDisponiveis.length,
        total_ocupados: horariosOcupados.length
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return res.status(500).json({ erro: 'Erro ao verificar disponibilidade' });
    }
  }
}

export default new AgendamentoController();
