import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Paciente = sequelize.define('Paciente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pacientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Paciente;
