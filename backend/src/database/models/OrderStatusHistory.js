import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class OrderStatusHistory extends Model {}

OrderStatusHistory.init(
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
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  },
  {
    sequelize,
    modelName: 'OrderStatusHistory',
    tableName: 'order_status_histories',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] }
    ]
  }
);

export default OrderStatusHistory;

