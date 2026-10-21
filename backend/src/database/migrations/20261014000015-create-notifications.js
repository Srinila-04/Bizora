export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'notifications',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('order', 'message', 'system', 'review', 'inventory'),
        defaultValue: 'system',
        allowNull: false
      },
      data: {
        type: Sequelize.JSON,
        defaultValue: {}
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

  await queryInterface.addIndex('notifications', ['userId'], { transaction });
  await queryInterface.addIndex('notifications', ['isRead'], { transaction });
  await queryInterface.addIndex('notifications', ['type'], { transaction });
  await queryInterface.addIndex('notifications', ['createdAt'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('notifications', { transaction });
};

export default { up, down };

