import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const UserVoucher = sequelize.define('UserVoucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
     voucherId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
     userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
     orderId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { timestamps: true })