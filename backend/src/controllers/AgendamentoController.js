import { Agendamento, Paciente, Clinica, Especializacao, Usuario, HorarioAtendimento, ConfiguracaoHorario, HorarioExcecao } from '../models/index.js';
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
            attributes: ['nome']
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
            [Op.notIn]: ['cancelado', 'faltou']
          }
        }
      });

      if (agendamentoExistente) {
        return res.status(409).json({ 
          erro: 'Horário indisponível',
          mensagem: 'Já existe um agendamento ativo para este horário',
          conflito: {
            id: agendamentoExistente.id,
            data: agendamentoExistente.data_agendamento,
            hora: agendamentoExistente.hora_agendamento,
            status: agendamentoExistente.status
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
            attributes: ['nome']
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

  // Verificar disponibilidade de horários (NOVA ARQUITETURA OTIMIZADA)
  async verificarDisponibilidade(req, res) {
    try {
      const { clinica_id, especializacao_id, data_agendamento } = req.query;

      if (!clinica_id || !especializacao_id || !data_agendamento) {
        return res.status(400).json({ 
          erro: 'Parâmetros faltando',
          mensagem: 'clinica_id, especializacao_id e data_agendamento são obrigatórios'
        });
      }

      // 1. Buscar configuração de horários recorrentes (considerando período de validade)
      const configuracao = await ConfiguracaoHorario.findOne({
        where: {
          clinica_id,
          especializacao_id,
          ativo: true,
          [Op.or]: [
            { data_inicio: null }, // Sem data início
            { data_inicio: { [Op.lte]: data_agendamento } } // Já começou
          ],
          [Op.or]: [
            { data_fim: null }, // Sem data fim
            { data_fim: { [Op.gte]: data_agendamento } } // Ainda não terminou
          ]
        }
      });

      // Se não há configuração, tentar buscar slots antigos (backward compatibility)
      if (!configuracao) {
        const slotsAntigos = await HorarioAtendimento.findAll({
          where: {
            clinica_id,
            especializacao_id,
            data_disponivel: data_agendamento,
            ativo: true
          },
          attributes: ['id', 'hora_inicio', 'hora_fim'],
          order: [['hora_inicio', 'ASC']]
        });

        // Buscar agendamentos ocupados
        const agendamentosOcupados = await Agendamento.findAll({
          where: {
            clinica_id,
            especializacao_id,
            data_agendamento,
            status: { [Op.notIn]: ['cancelado', 'faltou'] }
          },
          attributes: ['hora_agendamento']
        });

        const horariosOcupados = agendamentosOcupados.map(a => a.hora_agendamento);
        const horariosDisponiveis = slotsAntigos
          .filter(slot => !horariosOcupados.includes(slot.hora_inicio))
          .map(slot => ({ hora_inicio: slot.hora_inicio, hora_fim: slot.hora_fim }));

        return res.status(200).json({ 
          horariosDisponiveis,
          horariosOcupados,
          total_disponiveis: horariosDisponiveis.length,
          total_ocupados: horariosOcupados.length,
          modo: 'legacy'
        });
      }

      // 2. Verificar se a data está no dia da semana configurado
      const data = new Date(data_agendamento + 'T00:00:00');
      const diaSemana = data.getDay();

      if (!configuracao.dias_semana.includes(diaSemana)) {
        return res.status(200).json({ 
          horariosDisponiveis: [],
          horariosOcupados: [],
          total_disponiveis: 0,
          total_ocupados: 0,
          mensagem: 'Clínica não atende neste dia da semana'
        });
      }

      // 3. Verificar se há bloqueio total para este dia (hora_inicio e hora_fim são '00:00' e '23:59')
      const bloqueioTotal = await HorarioExcecao.findOne({
        where: {
          clinica_id,
          especializacao_id,
          data_excecao: data_agendamento,
          [Op.or]: [
            { hora_inicio: null, hora_fim: null },
            { hora_inicio: '00:00', hora_fim: '23:59' }
          ]
        }
      });

      if (bloqueioTotal) {
        return res.status(200).json({ 
          horariosDisponiveis: [],
          horariosOcupados: [],
          total_disponiveis: 0,
          total_ocupados: 0,
          mensagem: `Dia bloqueado: ${bloqueioTotal.motivo || bloqueioTotal.tipo}`
        });
      }

      // 4. Buscar exceções (bloqueios parciais) para este dia
      const excecoes = await HorarioExcecao.findAll({
        where: {
          clinica_id,
          especializacao_id,
          data_excecao: data_agendamento
        }
      });

      // 5. Buscar agendamentos já existentes (excluindo cancelados e faltou)
      const agendamentos = await Agendamento.findAll({
        where: {
          clinica_id,
          especializacao_id,
          data_agendamento,
          status: { [Op.notIn]: ['cancelado', 'faltou'] }
        },
        attributes: ['hora_agendamento']
      });

      // 6. Gerar slots dinamicamente baseado na configuração
      const timeToMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };

      const minutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const inicioMinutos = timeToMinutes(configuracao.hora_inicio);
      const fimMinutos = timeToMinutes(configuracao.hora_fim);
      const almocoInicio = configuracao.intervalo_almoco ? timeToMinutes(configuracao.hora_inicio_almoco) : null;
      const almocoFim = configuracao.intervalo_almoco ? timeToMinutes(configuracao.hora_fim_almoco) : null;

      const slots = [];

      for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += configuracao.duracao_slot) {
        // Pular intervalo de almoço
        if (configuracao.intervalo_almoco && minutos >= almocoInicio && minutos < almocoFim) {
          continue;
        }

        const horaInicioSlot = minutesToTime(minutos);
        const horaFimSlot = minutesToTime(minutos + configuracao.duracao_slot);

        if (minutos + configuracao.duracao_slot > fimMinutos) break;

        // Verificar se há exceção para este horário
        const bloqueado = excecoes.find(exc => 
          exc.hora_inicio && 
          horaInicioSlot >= exc.hora_inicio && 
          horaInicioSlot < exc.hora_fim
        );

        if (bloqueado) continue;

        // Verificar se já há agendamento para este horário
        const agendado = agendamentos.find(ag => ag.hora_agendamento === horaInicioSlot);

        if (!agendado) {
          slots.push({ hora_inicio: horaInicioSlot, hora_fim: horaFimSlot });
        }
      }

      const horariosOcupados = agendamentos.map(a => a.hora_agendamento);

      return res.status(200).json({ 
        horariosDisponiveis: slots,
        horariosOcupados,
        total_disponiveis: slots.length,
        total_ocupados: horariosOcupados.length,
        modo: 'otimizado'
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return res.status(500).json({ erro: 'Erro ao verificar disponibilidade', detalhes: error.message });
    }
  }
}

export default new AgendamentoController();
