import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class OrderItem extends Model {}

OrderItem.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'product_variants',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['productId'] },
      { fields: ['variantId'] }
    ]
  }
);

export default OrderItem;

