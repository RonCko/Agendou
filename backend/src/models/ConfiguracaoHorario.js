import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConfiguracaoHorario = sequelize.define('ConfiguracaoHorario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clinica_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clinicas',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  especializacao_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'especializacoes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  dias_semana: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    comment: 'Array de dias da semana: 0=Domingo, 1=Segunda, ..., 6=Sábado'
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Horário de início do atendimento'
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Horário de fim do atendimento'
  },
  duracao_slot: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Duração de cada slot em minutos'
  },
  intervalo_almoco: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se há intervalo de almoço'
  },
  hora_inicio_almoco: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Início do intervalo de almoço'
  },
  hora_fim_almoco: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Fim do intervalo de almoço'
  },
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de início da validade desta configuração (NULL = sem limite)'
  },
  data_fim: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de fim da validade (NULL = indeterminado)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'configuracao_horarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'especializacao_id', 'data_inicio']
    },
    {
      fields: ['clinica_id']
    },
    {
      fields: ['especializacao_id']
    },
    {
      fields: ['data_inicio', 'data_fim']
    }
  ]
});

export default ConfiguracaoHorario;
