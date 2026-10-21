import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class RefreshToken extends Model {
  get isExpired() {
    return new Date() >= this.expiresAt;
  }

  get isActive() {
    return !this.isRevoked && !this.isExpired;
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    deviceInfo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    replacedByToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tokenHash'] }
    ]
  }
);

export default RefreshToken;

