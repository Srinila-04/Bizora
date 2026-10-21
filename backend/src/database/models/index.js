import sequelize from '../../config/database.js';
import User from './User.js';
import RefreshToken from './RefreshToken.js';
import Business from './Business.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Payment from './Payment.js';
import PaymentStatusHistory from './PaymentStatusHistory.js';
import OrderStatusHistory from './OrderStatusHistory.js';
import Review from './Review.js';
import Wishlist from './Wishlist.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import Notification from './Notification.js';
import AuditLog from './AuditLog.js';
import Address from './Address.js';
import ProductVariant from './ProductVariant.js';
import StockMovement from './StockMovement.js';

// Setup Associations
// User <-> Business
User.hasMany(Business, { foreignKey: 'ownerId', as: 'businesses' });
Business.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Business <-> Category
Business.hasMany(Category, { foreignKey: 'businessId', as: 'categories' });
Category.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Business <-> Product
Business.hasMany(Product, { foreignKey: 'businessId', as: 'products' });
Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Business <-> Order
Business.hasMany(Order, { foreignKey: 'businessId', as: 'orders' });
Order.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// User (Customer) <-> Order
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order <-> Payment
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Business <-> Payment
Business.hasMany(Payment, { foreignKey: 'businessId', as: 'payments' });
Payment.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'customerId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Payment.belongsTo(User, { foreignKey: 'codCollectedBy', as: 'codCollector' });

// Payment <-> PaymentStatusHistory
Payment.hasMany(PaymentStatusHistory, { foreignKey: 'paymentId', as: 'statusHistories' });
PaymentStatusHistory.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// Order <-> OrderStatusHistory
Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistories' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Business <-> Review
Business.hasMany(Review, { foreignKey: 'businessId', as: 'reviews' });
Review.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'customerId', as: 'reviews' });
Review.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

// User <-> Wishlist
User.hasMany(Wishlist, { foreignKey: 'customerId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'customerId', as: 'user' });

// Product <-> Wishlist
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Conversation <-> Business & User
Business.hasMany(Conversation, { foreignKey: 'businessId', as: 'conversations' });
Conversation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

User.hasMany(Conversation, { foreignKey: 'customerId', as: 'conversations' });
Conversation.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

// Conversation <-> Product
Product.hasMany(Conversation, { foreignKey: 'productId', as: 'conversations' });
Conversation.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Conversation <-> Order
Order.hasMany(Conversation, { foreignKey: 'orderId', as: 'conversations' });
Conversation.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product <-> ProductVariant
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Business <-> ProductVariant
Business.hasMany(ProductVariant, { foreignKey: 'businessId', as: 'variants' });
ProductVariant.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// ProductVariant <-> OrderItem
ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// Business <-> StockMovement
Business.hasMany(StockMovement, { foreignKey: 'businessId', as: 'stockMovements' });
StockMovement.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Product <-> StockMovement
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ProductVariant <-> StockMovement
ProductVariant.hasMany(StockMovement, { foreignKey: 'variantId', as: 'stockMovements' });
StockMovement.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

// User (Actor) <-> StockMovement
User.hasMany(StockMovement, { foreignKey: 'actorId', as: 'stockAdjustments' });
StockMovement.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

// Order <-> StockMovement
Order.hasMany(StockMovement, { foreignKey: 'orderId', as: 'stockMovements' });
StockMovement.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export {
  sequelize,
  User,
  RefreshToken,
  Business,
  Category,
  Product,
  ProductVariant,
  StockMovement,
  Order,
  OrderItem,
  Payment,
  PaymentStatusHistory,
  OrderStatusHistory,
  Review,
  Wishlist,
  Conversation,
  Message,
  Notification,
  AuditLog,
  Address
};

export default {
  sequelize,
  User,
  RefreshToken,
  Business,
  Category,
  Product,
  ProductVariant,
  StockMovement,
  Order,
  OrderItem,
  Payment,
  PaymentStatusHistory,
  OrderStatusHistory,
  Review,
  Wishlist,
  Conversation,
  Message,
  Notification,
  AuditLog,
  Address
};

