import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class Conversation extends Model {}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('open', 'resolved', 'reopened'),
      defaultValue: 'open',
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      { fields: ['businessId'] },
      { fields: ['customerId'] },
      { fields: ['productId'] },
      { fields: ['orderId'] },
      { fields: ['status'] },
      { fields: ['lastMessageAt'] }
    ]
  }
);

export default Conversation;
