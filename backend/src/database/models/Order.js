import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
import { ORDER_STATUS_LIST, ORDER_STATUS, PAYMENT_STATUS_LIST, PAYMENT_STATUS } from '../../constants/orderStatus.js';

export class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    status: {
      type: DataTypes.ENUM(...ORDER_STATUS_LIST),
      defaultValue: ORDER_STATUS.PENDING,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM(...PAYMENT_STATUS_LIST),
      defaultValue: PAYMENT_STATUS.UNPAID,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: true
    },
    billingAddress: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    courierName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trackingUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    packedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dispatchedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    outForDeliveryAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['orderNumber'] },
      { fields: ['businessId'] },
      { fields: ['customerId'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
      { fields: ['createdAt'] },
      { fields: ['expiresAt'] },
      { fields: ['trackingNumber'] }
    ]
  }
);

export default Order;

