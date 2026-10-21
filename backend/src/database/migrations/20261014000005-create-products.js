export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'products',
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
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(220),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      compareAtPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      costPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
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

  await queryInterface.addIndex('products', ['businessId'], { transaction });
  await queryInterface.addIndex('products', ['categoryId'], { transaction });
  await queryInterface.addIndex('products', ['slug'], { transaction });
  await queryInterface.addIndex('products', ['status'], { transaction });
  await queryInterface.addIndex('products', ['isPublished'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('products', { transaction });
};

export default { up, down };

