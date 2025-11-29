router.post("/verificar-disponibilidade", async (req, res) => {
  try {
    const { clinica_id, especializacao_id, data_agendamento } = req.body;
    const diaSemana = new Date(data_agendamento).getDay();

    // Pega os horários da tabela horarios_agendados
    const horarioConfig = await db("horarios_agendados")
      .where({
        clinica_id,
        especializacao_id,
        dia_semana: diaSemana,
        ativo: true
      })
      .first();

    if (!horarioConfig) return res.json({ horariosOcupados: [] });

    // Gera todos os horários possíveis no dia
    const todosHorarios = [];
    let hora = new Date(`1970-01-01T${horarioConfig.hora_inicio}`);
    const horaFim = new Date(`1970-01-01T${horarioConfig.hora_fim}`);

    while (hora <= horaFim) {
      todosHorarios.push(hora.toTimeString().slice(0,5)); // "HH:MM"
      hora.setMinutes(hora.getMinutes() + horarioConfig.duracao_minutos);
    }

    // Busca agendamentos já ocupados
    const agendados = await db("agendamentos")
      .where({
        clinica_id,
        especializacao_id,
        data_agendamento
      })
      .pluck("hora_agendamento");

    return res.json({ horariosOcupados: agendados });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao verificar disponibilidade" });
  }
});
