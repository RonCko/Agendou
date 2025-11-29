import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HorarioAtendimento = sequelize.define('HorarioAtendimento', {
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
  data_disponivel: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data específica do slot disponível (ex: 2025-12-01)'
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Horário de início do slot (ex: 09:00)'
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Horário de fim do slot (ex: 09:30)'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se o slot está disponível para agendamento'
  }
}, {
  tableName: 'horarios_atendimento',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'especializacao_id', 'data_disponivel', 'hora_inicio']
    }
  ]
});

export default HorarioAtendimento;
