export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'categories',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

  await queryInterface.addIndex('categories', ['businessId'], { transaction });
  await queryInterface.addIndex('categories', ['slug'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('categories', { transaction });
};

export default { up, down };

