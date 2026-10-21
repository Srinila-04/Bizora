export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'messages',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      senderType: {
        type: Sequelize.ENUM('customer', 'business_owner', 'system'),
        defaultValue: 'customer',
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      readAt: {
        type: Sequelize.DATE,
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

  await queryInterface.addIndex('messages', ['conversationId'], { transaction });
  await queryInterface.addIndex('messages', ['senderId'], { transaction });
  await queryInterface.addIndex('messages', ['isRead'], { transaction });
  await queryInterface.addIndex('messages', ['createdAt'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('messages', { transaction });
};

export default { up, down };

