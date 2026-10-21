export const up = async (queryInterface, Sequelize, transaction) => {
  // 1. Update orders.status ENUM with complete lifecycle states
  await queryInterface.changeColumn(
    'orders',
    'status',
    {
      type: Sequelize.ENUM(
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'delivery_failed',
        'returned',
        'refunded'
      ),
      defaultValue: 'pending',
      allowNull: false
    },
    { transaction }
  );

  // 2. Add fulfilment & tracking columns to orders
  await queryInterface.addColumn(
    'orders',
    'courierName',
    {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'trackingNumber',
    {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'trackingUrl',
    {
      type: Sequelize.STRING(500),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'packedAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'dispatchedAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'outForDeliveryAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'deliveredAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'estimatedDeliveryDate',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'orders',
    'deliveryNotes',
    {
      type: Sequelize.TEXT,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex('orders', ['trackingNumber'], { transaction });

  // 3. Add COD tracking columns to payments
  await queryInterface.addColumn(
    'payments',
    'codStatus',
    {
      type: Sequelize.ENUM('pending', 'collected', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'payments',
    'codCollectedAt',
    {
      type: Sequelize.DATE,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'payments',
    'codCollectedBy',
    {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'payments',
    'codNotes',
    {
      type: Sequelize.TEXT,
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex('payments', ['codStatus'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  // Revert payments COD columns
  await queryInterface.removeColumn('payments', 'codNotes', { transaction });
  await queryInterface.removeColumn('payments', 'codCollectedBy', { transaction });
  await queryInterface.removeColumn('payments', 'codCollectedAt', { transaction });
  await queryInterface.removeColumn('payments', 'codStatus', { transaction });

  // Revert orders tracking columns
  await queryInterface.removeColumn('orders', 'deliveryNotes', { transaction });
  await queryInterface.removeColumn('orders', 'estimatedDeliveryDate', { transaction });
  await queryInterface.removeColumn('orders', 'deliveredAt', { transaction });
  await queryInterface.removeColumn('orders', 'outForDeliveryAt', { transaction });
  await queryInterface.removeColumn('orders', 'dispatchedAt', { transaction });
  await queryInterface.removeColumn('orders', 'packedAt', { transaction });
  await queryInterface.removeColumn('orders', 'trackingUrl', { transaction });
  await queryInterface.removeColumn('orders', 'trackingNumber', { transaction });
  await queryInterface.removeColumn('orders', 'courierName', { transaction });

  // Revert orders.status ENUM
  await queryInterface.changeColumn(
    'orders',
    'status',
    {
      type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    { transaction }
  );
};

export default { up, down };

