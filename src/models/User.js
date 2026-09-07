import {sequelize} from '../config/db.js';
import {DataTypes} from 'sequelize';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }

}, {
  timestamps: true
});