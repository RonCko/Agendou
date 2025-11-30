import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Especializacao = sequelize.define('Especializacao', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'especializacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Especializacao;
