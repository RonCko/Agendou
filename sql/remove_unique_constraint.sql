-- Remove a constraint UNIQUE antiga que impedia reutilizar horários cancelados
ALTER TABLE public.agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_clinica_id_especializacao_id_data_agendamento__key;

-- Remove o índice antigo se existir
DROP INDEX IF EXISTS unique_agendamento_horario;

-- Cria um índice único PARCIAL que permite múltiplos agendamentos cancelados/faltou
-- no mesmo horário, mas impede múltiplos agendamentos ativos
CREATE UNIQUE INDEX IF NOT EXISTS unique_agendamento_ativo 
ON public.agendamentos (clinica_id, especializacao_id, data_agendamento, hora_agendamento)
WHERE status NOT IN ('cancelado', 'faltou');

-- Comentário: 
-- Este índice único parcial garante que:
-- - Apenas um agendamento ATIVO (pendente/confirmado/realizado) pode existir por horário
-- - Múltiplos agendamentos cancelados/faltou podem existir no mesmo horário
-- - Isso permite reutilizar horários quando são cancelados
