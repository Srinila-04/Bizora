import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';
import { PAYMENT_METHOD_LIST, PAYMENT_TRANSACTION_STATUS_LIST, PAYMENT_METHODS, PAYMENT_TRANSACTION_STATUS, COD_STATUS_LIST, COD_STATUS } from '../../constants/paymentStatus.js';

export class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    paymentMethod: {
      type: DataTypes.ENUM(...PAYMENT_METHOD_LIST),
      defaultValue: PAYMENT_METHODS.CARD,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...PAYMENT_TRANSACTION_STATUS_LIST),
      defaultValue: PAYMENT_TRANSACTION_STATUS.PENDING,
      allowNull: false
    },
    transactionReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    gatewayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gatewaySignature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    refundId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING(50),
      defaultValue: 'razorpay',
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    codStatus: {
      type: DataTypes.ENUM(...COD_STATUS_LIST),
      defaultValue: COD_STATUS.PENDING,
      allowNull: false
    },
    codCollectedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    codCollectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    codNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['businessId'] },
      { fields: ['customerId'] },
      { fields: ['status'] },
      { unique: true, fields: ['transactionReference'] },
      { fields: ['gatewayOrderId'] },
      { fields: ['codStatus'] }
    ]
  }
);

export default Payment;

