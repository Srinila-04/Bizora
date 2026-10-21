import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class ProductVariant extends Model {
  get inStock() {
    return this.stockQuantity > 0;
  }

  get availableStock() {
    return Math.max(0, (this.physicalStock || 0) - (this.reservedQuantity || 0));
  }
}

ProductVariant.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    attributes: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    physicalStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active',
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'ProductVariant',
    tableName: 'product_variants',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['businessId'] },
      { fields: ['sku'] },
      { fields: ['businessId', 'sku'] },
      { fields: ['status'] }
    ]
  }
);

export default ProductVariant;

