export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'payments',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      paymentMethod: {
        type: Sequelize.ENUM('card', 'bank_transfer', 'cash_on_delivery', 'wallet', 'other'),
        defaultValue: 'card',
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'USD',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      transactionReference: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      provider: {
        type: Sequelize.STRING(50),
        defaultValue: 'mock_provider',
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {}
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

  await queryInterface.addIndex('payments', ['orderId'], { transaction });
  await queryInterface.addIndex('payments', ['businessId'], { transaction });
  await queryInterface.addIndex('payments', ['customerId'], { transaction });
  await queryInterface.addIndex('payments', ['status'], { transaction });
  await queryInterface.addIndex('payments', ['transactionReference'], { unique: true, transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('payments', { transaction });
};

export default { up, down };

