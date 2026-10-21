import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class Product extends Model {
  get inStock() {
    return this.stockQuantity > 0;
  }

  get availableStock() {
    return Math.max(0, (this.physicalStock || 0) - (this.reservedQuantity || 0));
  }
}

Product.init(
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    compareAtPrice: {
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
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true
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
      defaultValue: 5
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'archived'),
      defaultValue: 'active',
      allowNull: false
    },
    displayStyle: {
      type: DataTypes.ENUM('standard', 'editorial', 'detailed'),
      defaultValue: 'standard',
      allowNull: false
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
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['businessId'] },
      { fields: ['categoryId'] },
      { fields: ['slug'] },
      { fields: ['status'] },
      { fields: ['isPublished'] }
    ]
  }
);

export default Product;

