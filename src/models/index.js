import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { Product } from './Product.js';
import { Contact } from './Contact.js';

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export { sequelize, User, Order, OrderItem, Product, Contact };