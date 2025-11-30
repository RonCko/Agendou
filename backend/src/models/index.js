import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Paciente from './Paciente.js';
import Clinica from './Clinica.js';
import Especializacao from './Especializacao.js';
import ClinicaEspecializacao from './ClinicaEspecializacao.js';
import HorarioAtendimento from './HorarioAtendimento.js';
import ConfiguracaoHorario from './ConfiguracaoHorario.js';
import HorarioExcecao from './HorarioExcecao.js';
import Agendamento from './Agendamento.js';

// ========================================
// RELACIONAMENTOS
// ========================================

// Usuario -> Paciente (1:1)
Usuario.hasOne(Paciente, {
  foreignKey: 'usuario_id',
  as: 'paciente',
  onDelete: 'CASCADE'
});
Paciente.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Usuario -> Clinica (1:1)
Usuario.hasOne(Clinica, {
  foreignKey: 'usuario_id',
  as: 'clinica',
  onDelete: 'CASCADE'
});
Clinica.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Clinica <-> Especializacao (N:N via ClinicaEspecializacao)
Clinica.belongsToMany(Especializacao, {
  through: ClinicaEspecializacao,
  foreignKey: 'clinica_id',
  otherKey: 'especializacao_id',
  as: 'especializacoes'
});
Especializacao.belongsToMany(Clinica, {
  through: ClinicaEspecializacao,
  foreignKey: 'especializacao_id',
  otherKey: 'clinica_id',
  as: 'clinicas'
});

// Relacionamentos diretos com a tabela intermediária
Clinica.hasMany(ClinicaEspecializacao, {
  foreignKey: 'clinica_id',
  as: 'clinica_especializacoes'
});
ClinicaEspecializacao.belongsTo(Clinica, {
  foreignKey: 'clinica_id',
  as: 'clinica'
});

Especializacao.hasMany(ClinicaEspecializacao, {
  foreignKey: 'especializacao_id',
  as: 'clinica_especializacoes'
});
ClinicaEspecializacao.belongsTo(Especializacao, {
  foreignKey: 'especializacao_id',
  as: 'especializacao'
});

// Clinica -> HorarioAtendimento (1:N)
Clinica.hasMany(HorarioAtendimento, {
  foreignKey: 'clinica_id',
  as: 'horarios',
  onDelete: 'CASCADE'
});
HorarioAtendimento.belongsTo(Clinica, {
  foreignKey: 'clinica_id',
  as: 'clinica'
});

// Especializacao -> HorarioAtendimento (1:N)
Especializacao.hasMany(HorarioAtendimento, {
  foreignKey: 'especializacao_id',
  as: 'horarios_atendimento'
});
HorarioAtendimento.belongsTo(Especializacao, {
  foreignKey: 'especializacao_id',
  as: 'especializacao'
});

// Clinica -> ConfiguracaoHorario (1:N)
Clinica.hasMany(ConfiguracaoHorario, {
  foreignKey: 'clinica_id',
  as: 'configuracoes_horarios',
  onDelete: 'CASCADE'
});
ConfiguracaoHorario.belongsTo(Clinica, {
  foreignKey: 'clinica_id',
  as: 'clinica'
});

// Especializacao -> ConfiguracaoHorario (1:N)
Especializacao.hasMany(ConfiguracaoHorario, {
  foreignKey: 'especializacao_id',
  as: 'configuracoes_horarios'
});
ConfiguracaoHorario.belongsTo(Especializacao, {
  foreignKey: 'especializacao_id',
  as: 'especializacao'
});

// Clinica -> HorarioExcecao (1:N)
Clinica.hasMany(HorarioExcecao, {
  foreignKey: 'clinica_id',
  as: 'horarios_excecoes',
  onDelete: 'CASCADE'
});
HorarioExcecao.belongsTo(Clinica, {
  foreignKey: 'clinica_id',
  as: 'clinica'
});

// Especializacao -> HorarioExcecao (1:N)
Especializacao.hasMany(HorarioExcecao, {
  foreignKey: 'especializacao_id',
  as: 'horarios_excecoes'
});
HorarioExcecao.belongsTo(Especializacao, {
  foreignKey: 'especializacao_id',
  as: 'especializacao'
});

// Paciente -> Agendamento (1:N)
Paciente.hasMany(Agendamento, {
  foreignKey: 'paciente_id',
  as: 'agendamentos',
  onDelete: 'CASCADE'
});
Agendamento.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente'
});

// Clinica -> Agendamento (1:N)
Clinica.hasMany(Agendamento, {
  foreignKey: 'clinica_id',
  as: 'agendamentos',
  onDelete: 'CASCADE'
});
Agendamento.belongsTo(Clinica, {
  foreignKey: 'clinica_id',
  as: 'clinica'
});

// Especializacao -> Agendamento (1:N)
Especializacao.hasMany(Agendamento, {
  foreignKey: 'especializacao_id',
  as: 'agendamentos'
});
Agendamento.belongsTo(Especializacao, {
  foreignKey: 'especializacao_id',
  as: 'especializacao'
});

// ========================================
// EXPORTAR MODELOS
// ========================================

export {
  sequelize,
  Usuario,
  Paciente,
  Clinica,
  Especializacao,
  ClinicaEspecializacao,
  HorarioAtendimento,
  ConfiguracaoHorario,
  HorarioExcecao,
  Agendamento
};

export default {
  sequelize,
  Usuario,
  Paciente,
  Clinica,
  Especializacao,
  ClinicaEspecializacao,
  HorarioAtendimento,
  ConfiguracaoHorario,
  HorarioExcecao,
  Agendamento
};
