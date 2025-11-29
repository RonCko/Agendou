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
  dia_semana: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    },
    comment: '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado'
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'horarios_atendimento',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['clinica_id', 'dia_semana', 'hora_inicio']
    }
  ]
});

export default HorarioAtendimento;
