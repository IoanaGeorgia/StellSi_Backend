import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    code: {
        type: DataTypes.TEXT,
        allowNul: false
    },
    sum: {
        type: DataTypes.INTEGER,
        allowNul: false
    },
    percent:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, { timestamps: true })