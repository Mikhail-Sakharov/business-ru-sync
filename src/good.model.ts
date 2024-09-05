import {Model, DataTypes} from 'sequelize';

import {sequelize} from './config/database.config';

export class Good extends Model {}

Good.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    cost: {
      type: DataTypes.FLOAT
    },
    archive: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    bru_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bru_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bru_measure_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bru_partner_id: {
      type: DataTypes.INTEGER
    },
    bru_responsible_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Good',
    timestamps: false
  }
);
