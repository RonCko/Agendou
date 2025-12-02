import { Agendamento, Clinica, Paciente, Especializacao } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

class DashboardController {
  // Dashboard da clínica
  async clinica(req, res) {
    try {
      // Buscar clínica do usuário
      const clinica = await Clinica.findOne({ where: { usuario_id: req.usuarioId } });
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

      // Calcular receita estimada (agendamentos realizados)
      const agendamentosRealizados = await Agendamento.findAll({
        where: {
          clinica_id: clinica.id,
          status: 'realizado'
        },
        attributes: ['especializacao_id'],
        raw: true
      });

      let receitaTotal = 0;
      let agendamentosSemPreco = 0;
      for (const agendamento of agendamentosRealizados) {
        // Buscar preço da especialização na clínica
        const clinicaEspec = await sequelize.models.ClinicaEspecializacao.findOne({
          where: {
            clinica_id: clinica.id,
            especializacao_id: agendamento.especializacao_id
          },
          attributes: ['preco']
        });
        if (clinicaEspec && clinicaEspec.preco) {
          receitaTotal += parseFloat(clinicaEspec.preco);
        } else {
          agendamentosSemPreco++;
        }
      }

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
          agendamentosPorStatus: statusMap,
          receitaTotal,
          agendamentosSemPreco
        },
        proximosAgendamentos,
        agendamentosPorEspecializacao: agendamentosPorEspecializacao.map(a => ({
          especializacao: a.especializacao?.nome || 'Sem especialização',
          total: parseInt(a.dataValues.total)
        })),
        graficoUltimos30Dias: agendamentosUltimos30
      });
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard' });
    }
  }

}

export default new DashboardController();
