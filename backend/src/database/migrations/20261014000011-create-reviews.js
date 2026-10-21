export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'reviews',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isVerifiedPurchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.ENUM('published', 'hidden', 'flagged'),
        defaultValue: 'published',
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

  await queryInterface.addIndex('reviews', ['productId'], { transaction });
  await queryInterface.addIndex('reviews', ['customerId'], { transaction });
  await queryInterface.addIndex('reviews', ['businessId'], { transaction });
  await queryInterface.addIndex('reviews', ['rating'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('reviews', { transaction });
};

export default { up, down };

