import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class Business extends Model {}

Business.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150]
      }
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    banner: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    taxId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    addressDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    themeSettings: {
      type: DataTypes.JSON,
      defaultValue: {
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        font: 'Inter',
        layout: 'standard'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active',
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Business',
    tableName: 'businesses',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['ownerId'] },
      { fields: ['isPublished'] },
      { fields: ['status'] }
    ]
  }
);

export default Business;

