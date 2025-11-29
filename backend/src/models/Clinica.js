import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Clinica = sequelize.define('Clinica', {
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
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: true
  },
  nome_fantasia: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  telefone_comercial: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  foto_capa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clinicas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Clinica;
