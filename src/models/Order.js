import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Order = sequelize.define('Order', {
   id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    totalSum: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    billingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},
    { timestamps: true }
)