export const up = async (queryInterface, Sequelize, transaction) => {
  // 1. Drop existing unique index on [businessId, customerId] so multiple conversations can exist for different contexts
  try {
    await queryInterface.removeIndex('conversations', 'conversations_business_id_customer_id', { transaction });
  } catch (err) {
    // If index has a different name in some DB instances, try removing by fields
    try {
      await queryInterface.removeIndex('conversations', ['businessId', 'customerId'], { transaction });
    } catch (e) {
      // Index might have already been removed
    }
  }

  // 2. Add productId and orderId to conversations
  await queryInterface.addColumn(
    'conversations',
    'productId',
    {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'conversations',
    'orderId',
    {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    { transaction }
  );

  // 3. Update status column to VARCHAR(32) to support 'open', 'resolved', 'reopened'
  // In MySQL, modifying an ENUM to VARCHAR is safe and avoids restrictive ENUM alterations
  await queryInterface.changeColumn(
    'conversations',
    'status',
    {
      type: Sequelize.STRING(32),
      defaultValue: 'open',
      allowNull: false
    },
    { transaction }
  );

  // Migrate existing data values: 'active' -> 'open', 'archived' -> 'resolved'
  const sequelize = queryInterface.sequelize;
  await sequelize.query(
    "UPDATE conversations SET status = 'open' WHERE status = 'active'",
    { transaction }
  );
  await sequelize.query(
    "UPDATE conversations SET status = 'resolved' WHERE status = 'archived'",
    { transaction }
  );

  // 4. Add new indexes to conversations
  await queryInterface.addIndex('conversations', ['productId'], { transaction });
  await queryInterface.addIndex('conversations', ['orderId'], { transaction });
  await queryInterface.addIndex('conversations', ['status'], { transaction });

  // 5. Add attachments column to messages
  await queryInterface.addColumn(
    'messages',
    'attachments',
    {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    },
    { transaction }
  );

  // Allow content in messages to be nullable if an attachment is provided
  await queryInterface.changeColumn(
    'messages',
    'content',
    {
      type: Sequelize.TEXT,
      allowNull: true
    },
    { transaction }
  );

  // 6. Add composite index on messages [conversationId, isRead]
  await queryInterface.addIndex('messages', ['conversationId', 'isRead'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  // Revert messages
  try {
    await queryInterface.removeIndex('messages', ['conversationId', 'isRead'], { transaction });
  } catch (e) {}

  await queryInterface.removeColumn('messages', 'attachments', { transaction });

  // Revert conversations
  try {
    await queryInterface.removeIndex('conversations', ['productId'], { transaction });
    await queryInterface.removeIndex('conversations', ['orderId'], { transaction });
    await queryInterface.removeIndex('conversations', ['status'], { transaction });
  } catch (e) {}

  await queryInterface.removeColumn('conversations', 'productId', { transaction });
  await queryInterface.removeColumn('conversations', 'orderId', { transaction });

  await queryInterface.changeColumn(
    'conversations',
    'status',
    {
      type: Sequelize.ENUM('active', 'archived'),
      defaultValue: 'active',
      allowNull: false
    },
    { transaction }
  );

  // Re-add unique index on [businessId, customerId]
  await queryInterface.addIndex('conversations', ['businessId', 'customerId'], {
    unique: true,
    name: 'conversations_business_id_customer_id',
    transaction
  });
};

export default { up, down };

