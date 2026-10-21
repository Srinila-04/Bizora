import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

export class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entityId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    ipAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['action'] },
      { fields: ['entityType'] },
      { fields: ['entityId'] }
    ]
  }
);

export default AuditLog;

