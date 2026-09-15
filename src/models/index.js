import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { Product } from './Product.js';
import { Contact } from './Contact.js';
import { Voucher } from './Voucher.js';
import { UserVoucher } from './UserVoucher.js';

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Voucher.hasMany(UserVoucher, { foreignKey: 'voucherId', onDelete: 'CASCADE' });
UserVoucher.belongsTo(Voucher, { foreignKey: 'voucherId' });

User.hasMany(UserVoucher, {foreignKey:'userId', onDelete:"CASCADE"});
UserVoucher.belongsTo(User, {foreignKey: 'userId'})

Order.hasOne(UserVoucher, { foreignKey: 'orderId', onDelete: 'SET NULL' });
UserVoucher.belongsTo(Order, { foreignKey: 'orderId' });

export { sequelize, User, Order, OrderItem, Product, Contact, Voucher, UserVoucher };