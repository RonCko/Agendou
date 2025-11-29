import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paciente_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'pacientes',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
    }
  },
  data_agendamento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_agendamento: {
    type: DataTypes.TIME,
    allowNull: false
  },
  medico_nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'realizado'),
    defaultValue: 'pendente'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'agendamentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'especializacao_id', 'data_agendamento', 'hora_agendamento'],
      name: 'unique_agendamento_horario'
    }
  ]
});

export default Agendamento;
