import { Agendamento, Clinica, Paciente, Especializacao } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class DashboardController {
  // Dashboard da clínica
  async clinica(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;

      // Buscar clínica do usuário
      const clinica = await Clinica.findOne({ where: { usuario_id: usuario.id } });
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada' });
      }

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      // Total de agendamentos
      const totalAgendamentos = await Agendamento.count({
        where: { clinica_id: clinica.id }
      });

      // Agendamentos por status
      const agendamentosPorStatus = await Agendamento.findAll({
        where: { clinica_id: clinica.id },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['status'],
        raw: true
      });

      const statusMap = agendamentosPorStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.total);
        return acc;
      }, {});

      // Agendamentos do mês atual
      const agendamentosMes = await Agendamento.count({
        where: {
          clinica_id: clinica.id,
          data_agendamento: {
            [Op.between]: [inicioMes, fimMes]
          }
        }
      });

      // Agendamentos de hoje
      const agendamentosHoje = await Agendamento.count({
        where: {
          clinica_id: clinica.id,
          data_agendamento: hoje.toISOString().split('T')[0]
        }
      });

      // Próximos agendamentos (5 próximos)
      const proximosAgendamentos = await Agendamento.findAll({
        where: {
          clinica_id: clinica.id,
          data_agendamento: { [Op.gte]: hoje.toISOString().split('T')[0] },
          status: { [Op.in]: ['pendente', 'confirmado'] }
        },
        include: [
          {
            association: 'paciente',
            include: [{ association: 'usuario', attributes: ['nome', 'telefone'] }]
          },
          { association: 'especializacao', attributes: ['nome'] }
        ],
        order: [['data_agendamento', 'ASC'], ['hora_agendamento', 'ASC']],
        limit: 5
      });

      // Agendamentos por especialização
      const agendamentosPorEspecializacao = await Agendamento.findAll({
        where: { clinica_id: clinica.id },
        attributes: [
          'especializacao_id',
          [sequelize.fn('COUNT', sequelize.col('Agendamento.id')), 'total']
        ],
        include: [
          {
            association: 'especializacao',
            attributes: ['nome']
          }
        ],
        group: ['especializacao_id', 'especializacao.id', 'especializacao.nome'],
        raw: false
      });

      // Gráfico: agendamentos dos últimos 30 dias
      const ultimos30Dias = new Date();
      ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);

      const agendamentosUltimos30 = await Agendamento.findAll({
        where: {
          clinica_id: clinica.id,
          data_agendamento: { [Op.gte]: ultimos30Dias }
        },
        attributes: [
          'data_agendamento',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['data_agendamento'],
        order: [['data_agendamento', 'ASC']],
        raw: true
      });

      return res.status(200).json({
        resumo: {
          totalAgendamentos,
          agendamentosMes,
          agendamentosHoje,
          agendamentosPorStatus: statusMap
        },
        proximosAgendamentos,
        agendamentosPorEspecializacao: agendamentosPorEspecializacao.map(a => ({
          especializacao: a.especializacao?.nome || 'Sem especialização',
          total: parseInt(a.dataValues.total)
        })),
        graficoUltimos30Dias: agendamentosUltimos30
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard da clínica:', error);
      return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard' });
    }
  }

  // Dashboard do paciente
  async paciente(req, res) {
    try {
      const usuario = req.usuario || req.usuarioSessao;

      // Buscar paciente do usuário
      const paciente = await Paciente.findOne({ where: { usuario_id: usuario.id } });
      if (!paciente) {
        return res.status(404).json({ erro: 'Paciente não encontrado' });
      }

      // Total de agendamentos
      const totalAgendamentos = await Agendamento.count({
        where: { paciente_id: paciente.id }
      });

      // Agendamentos por status
      const agendamentosPorStatus = await Agendamento.findAll({
        where: { paciente_id: paciente.id },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['status'],
        raw: true
      });

      const statusMap = agendamentosPorStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.total);
        return acc;
      }, {});

      // Próximos agendamentos
      const hoje = new Date();
      const proximosAgendamentos = await Agendamento.findAll({
        where: {
          paciente_id: paciente.id,
          data_agendamento: { [Op.gte]: hoje.toISOString().split('T')[0] },
          status: { [Op.in]: ['pendente', 'confirmado'] }
        },
        include: [
          {
            association: 'clinica',
            include: [{ association: 'usuario', attributes: ['nome', 'telefone'] }]
          },
          { association: 'especializacao', attributes: ['nome'] }
        ],
        order: [['data_agendamento', 'ASC'], ['hora_agendamento', 'ASC']],
        limit: 5
      });

      // Histórico recente (últimos 5 realizados/cancelados)
      const historicoRecente = await Agendamento.findAll({
        where: {
          paciente_id: paciente.id,
          status: { [Op.in]: ['realizado', 'cancelado'] }
        },
        include: [
          {
            association: 'clinica',
            include: [{ association: 'usuario', attributes: ['nome'] }]
          },
          { association: 'especializacao', attributes: ['nome'] }
        ],
        order: [['data_agendamento', 'DESC']],
        limit: 5
      });

      // Avaliações pendentes (agendamentos realizados sem avaliação)
      const agendamentosRealizados = await Agendamento.findAll({
        where: {
          paciente_id: paciente.id,
          status: 'realizado'
        },
        attributes: ['clinica_id']
      });

      const clinicasRealizadas = [...new Set(agendamentosRealizados.map(a => a.clinica_id))];

      return res.status(200).json({
        resumo: {
          totalAgendamentos,
          agendamentosPorStatus: statusMap
        },
        proximosAgendamentos,
        historicoRecente
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard do paciente:', error);
      return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard' });
    }
  }

  // Dashboard admin (estatísticas gerais)
  async admin(req, res) {
    try {
      // Total de usuários por tipo
      const totalClinicas = await Clinica.count();
      const totalPacientes = await Paciente.count();

      // Total de agendamentos
      const totalAgendamentos = await Agendamento.count();

      // Agendamentos por status (geral)
      const agendamentosPorStatus = await Agendamento.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['status'],
        raw: true
      });

      // Clínicas mais populares (com mais agendamentos)
      const clinicasPopulares = await Agendamento.findAll({
        attributes: [
          'clinica_id',
          [sequelize.fn('COUNT', sequelize.col('Agendamento.id')), 'total_agendamentos']
        ],
        include: [
          {
            association: 'clinica',
            attributes: ['nome_fantasia'],
            include: [{ association: 'usuario', attributes: ['nome'] }]
          }
        ],
        group: ['clinica_id', 'clinica.id', 'clinica.nome_fantasia', 'clinica->usuario.id', 'clinica->usuario.nome'],
        order: [[sequelize.literal('total_agendamentos'), 'DESC']],
        limit: 5,
        raw: false
      });

      // Especialidades mais procuradas
      const especialidadesPopulares = await Agendamento.findAll({
        attributes: [
          'especializacao_id',
          [sequelize.fn('COUNT', sequelize.col('Agendamento.id')), 'total']
        ],
        include: [
          {
            association: 'especializacao',
            attributes: ['nome']
          }
        ],
        group: ['especializacao_id', 'especializacao.id', 'especializacao.nome'],
        order: [[sequelize.literal('total'), 'DESC']],
        limit: 5,
        raw: false
      });

      return res.status(200).json({
        resumo: {
          totalClinicas,
          totalPacientes,
          totalAgendamentos
        },
        agendamentosPorStatus: agendamentosPorStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.total);
          return acc;
        }, {}),
        clinicasPopulares: clinicasPopulares.map(c => ({
          nome: c.clinica?.nome_fantasia || c.clinica?.usuario?.nome,
          totalAgendamentos: parseInt(c.dataValues.total_agendamentos)
        })),
        especialidadesPopulares: especialidadesPopulares.map(e => ({
          nome: e.especializacao?.nome,
          total: parseInt(e.dataValues.total)
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard admin:', error);
      return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard' });
    }
  }
}

export default new DashboardController();
