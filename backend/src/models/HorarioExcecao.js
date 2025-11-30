import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HorarioExcecao = sequelize.define('HorarioExcecao', {
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
  data_excecao: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data específica do bloqueio/exceção'
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '00:00',
    comment: 'Horário de início do bloqueio (NULL = dia inteiro desde 00:00)'
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '23:59',
    comment: 'Horário de fim do bloqueio (NULL = dia inteiro até 23:59)'
  },
  tipo: {
    type: DataTypes.ENUM('bloqueio', 'feriado', 'evento', 'customizado'),
    allowNull: false,
    defaultValue: 'bloqueio',
    comment: 'Tipo de exceção'
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do bloqueio'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'horarios_excecoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'especializacao_id', 'data_excecao', 'hora_inicio']
    },
    {
      fields: ['clinica_id', 'data_excecao']
    }
  ]
});

export default HorarioExcecao;
