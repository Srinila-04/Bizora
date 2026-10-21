import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class StockMovement extends Model {}

StockMovement.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
      allowNull: false
    },
    movementType: {
      type: DataTypes.ENUM(
        'stock_received',
        'damage_loss',
        'correction',
        'return_restock',
        'order_reservation',
        'order_release',
        'order_fulfilled',
        'initial_setup',
        'manual_adjustment'
      ),
      allowNull: false
    },
    quantityChange: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    physicalStockBefore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    physicalStockAfter: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reservedBefore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    reservedAfter: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    availableBefore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    availableAfter: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    orderNumber: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    actorRole: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: true,
    indexes: [
      { fields: ['businessId'] },
      { fields: ['productId'] },
      { fields: ['variantId'] },
      { fields: ['movementType'] },
      { fields: ['createdAt'] },
      { fields: ['businessId', 'createdAt'] }
    ]
  }
);

export default StockMovement;

