export const up = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.createTable(
    'refresh_tokens',
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
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      deviceInfo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isRevoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      replacedByToken: {
        type: Sequelize.STRING(255),
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

  await queryInterface.addIndex('refresh_tokens', ['userId'], { transaction });
  await queryInterface.addIndex('refresh_tokens', ['tokenHash'], { transaction });
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('refresh_tokens', { transaction });
};

export default { up, down };

