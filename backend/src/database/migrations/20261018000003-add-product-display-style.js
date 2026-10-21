export const up = async (queryInterface, Sequelize, transaction) => {
  // Add displayStyle column to products table
  // Options: 'standard' (default), 'editorial', 'detailed'
  await queryInterface.addColumn(
    'products',
    'displayStyle',
    {
      type: Sequelize.ENUM('standard', 'editorial', 'detailed'),
      defaultValue: 'standard',
      allowNull: false
    },
    { transaction }
  );
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.removeColumn('products', 'displayStyle', { transaction });
};

export default { up, down };

