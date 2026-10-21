export const up = async (queryInterface, Sequelize, transaction) => {
  // 1. Add gatewayOrderId to payments
  await queryInterface.addColumn(
    'payments',
    'gatewayOrderId',
    {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex('payments', ['gatewayOrderId'], { transaction });

  // 2. Add gatewaySignature to payments
  await queryInterface.addColumn(
    'payments',
    'gatewaySignature',
    {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    { transaction }
  );

  // 3. Add refund columns to payments
  await queryInterface.addColumn(
    'payments',
    'refundId',
    {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'payments',
    'refundAmount',
    {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
    { transaction }
  );

  // 4. Update payments paymentMethod ENUM to include 'upi'
  await queryInterface.changeColumn(
    'payments',
    'paymentMethod',
    {
      type: Sequelize.ENUM('card', 'bank_transfer', 'cash_on_delivery', 'wallet', 'upi', 'other'),
      defaultValue: 'card',
      allowNull: false
    },
    { transaction }
  );

  // 5. Update payments currency default to 'INR'
  await queryInterface.changeColumn(
    'payments',
    'currency',
    {
      type: Sequelize.STRING(10),
      defaultValue: 'INR',
      allowNull: false
    },
    { transaction }
  );

  // 6. Add expiresAt to orders
  await queryInterface.addColumn(
    'orders',
    'expiresAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex('orders', ['expiresAt'], { transaction });

  // 7. Add currency to orders
  await queryInterface.addColumn(
    'orders',
    'currency',
    {
      type: Sequelize.STRING(10),
      defaultValue: 'INR',
      allowNull: false
    },
    { transaction }
  );
};

export const down = async (queryInterface, Sequelize, transaction) => {
  // Remove columns and revert changes
  await queryInterface.removeColumn('orders', 'currency', { transaction });
  await queryInterface.removeColumn('orders', 'expiresAt', { transaction });

  await queryInterface.removeColumn('payments', 'refundAmount', { transaction });
  await queryInterface.removeColumn('payments', 'refundId', { transaction });
  await queryInterface.removeColumn('payments', 'gatewaySignature', { transaction });
  await queryInterface.removeColumn('payments', 'gatewayOrderId', { transaction });

  await queryInterface.changeColumn(
    'payments',
    'currency',
    {
      type: Sequelize.STRING(10),
      defaultValue: 'USD',
      allowNull: false
    },
    { transaction }
  );

  await queryInterface.changeColumn(
    'payments',
    'paymentMethod',
    {
      type: Sequelize.ENUM('card', 'bank_transfer', 'cash_on_delivery', 'wallet', 'other'),
      defaultValue: 'card',
      allowNull: false
    },
    { transaction }
  );
};

export default { up, down };

