import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClinicaEspecializacao = sequelize.define('ClinicaEspecializacao', {
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
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  duracao_minutos: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clinica_especializacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'especializacao_id']
    }
  ]
});

export default ClinicaEspecializacao;
