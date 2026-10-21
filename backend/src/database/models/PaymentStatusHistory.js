import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class PaymentStatusHistory extends Model {}

PaymentStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    reason: {
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
    modelName: 'PaymentStatusHistory',
    tableName: 'payment_status_histories',
    timestamps: true,
    indexes: [
      { fields: ['paymentId'] }
    ]
  }
);

export default PaymentStatusHistory;

