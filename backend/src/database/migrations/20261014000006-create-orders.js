export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'orders',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
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
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'paid', 'refunded', 'failed'),
        defaultValue: 'unpaid',
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      shippingAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      shippingAddress: {
        type: Sequelize.JSON,
        allowNull: true
      },
      billingAddress: {
        type: Sequelize.JSON,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelReason: {
        type: Sequelize.TEXT,
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

  await queryInterface.addIndex('orders', ['orderNumber'], { unique: true, transaction });
  await queryInterface.addIndex('orders', ['businessId'], { transaction });
  await queryInterface.addIndex('orders', ['customerId'], { transaction });
  await queryInterface.addIndex('orders', ['status'], { transaction });
  await queryInterface.addIndex('orders', ['paymentStatus'], { transaction });
  await queryInterface.addIndex('orders', ['createdAt'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('orders', { transaction });
};

export default { up, down };

