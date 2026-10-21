export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'conversations',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('active', 'archived'),
        defaultValue: 'active',
        allowNull: false
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

  await queryInterface.addIndex('conversations', ['businessId', 'customerId'], {
    unique: true,
    transaction
  });
  await queryInterface.addIndex('conversations', ['businessId'], { transaction });
  await queryInterface.addIndex('conversations', ['customerId'], { transaction });
  await queryInterface.addIndex('conversations', ['lastMessageAt'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('conversations', { transaction });
};

export default { up, down };

