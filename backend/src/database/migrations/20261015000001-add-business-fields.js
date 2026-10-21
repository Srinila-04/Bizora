export const up = async (queryInterface, Sequelize, transaction) => {
  const tableInfo = await queryInterface.describeTable('businesses');

  if (!tableInfo.website) {
    await queryInterface.addColumn(
      'businesses',
      'website',
      {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      { transaction }
    );
  }

  if (!tableInfo.taxId) {
    await queryInterface.addColumn(
      'businesses',
      'taxId',
      {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      { transaction }
    );
  }

  if (!tableInfo.socialLinks) {
    await queryInterface.addColumn(
      'businesses',
      'socialLinks',
      {
        type: Sequelize.JSON,
        allowNull: true
      },
      { transaction }
    );
  }

  if (!tableInfo.addressDetails) {
    await queryInterface.addColumn(
      'businesses',
      'addressDetails',
      {
        type: Sequelize.JSON,
        allowNull: true
      },
      { transaction }
    );
  }
};

export const down = async (queryInterface, Sequelize, transaction) => {
  const tableInfo = await queryInterface.describeTable('businesses');

  if (tableInfo.addressDetails) {
    await queryInterface.removeColumn('businesses', 'addressDetails', { transaction });
  }
  if (tableInfo.socialLinks) {
    await queryInterface.removeColumn('businesses', 'socialLinks', { transaction });
  }
  if (tableInfo.taxId) {
    await queryInterface.removeColumn('businesses', 'taxId', { transaction });
  }
  if (tableInfo.website) {
    await queryInterface.removeColumn('businesses', 'website', { transaction });
  }
};

export default { up, down };

