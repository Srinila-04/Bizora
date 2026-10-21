export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'audit_logs',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entityType: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entityId: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      details: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      ipAddress: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  await queryInterface.addIndex('audit_logs', ['userId'], { transaction });
  await queryInterface.addIndex('audit_logs', ['action'], { transaction });
  await queryInterface.addIndex('audit_logs', ['entityType'], { transaction });
  await queryInterface.addIndex('audit_logs', ['entityId'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('audit_logs', { transaction });
};

export default { up, down };

