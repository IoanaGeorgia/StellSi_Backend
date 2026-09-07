import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const Product = sequelize.define('Product', {
 id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  constellation: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  rightAscension: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  declination: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  apparentMagnitude: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  absoluteMagnitude: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  distanceLightYear: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  spectralClass: {
    type: DataTypes.STRING,
    allowNull: true, 
  }
}, {
  timestamps: true
});