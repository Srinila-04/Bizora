export const up = async (queryInterface, Sequelize, transaction) => {
  const [indexes] = await queryInterface.sequelize.query(
    "SHOW INDEX FROM `users` WHERE Column_name = 'phone';",
    { transaction }
  );

  if (indexes.length === 0) {
    await queryInterface.addIndex('users', ['phone'], { transaction });
  }
};

export const down = async (queryInterface, Sequelize, transaction) => {
  const [indexes] = await queryInterface.sequelize.query(
    "SHOW INDEX FROM `users` WHERE Column_name = 'phone';",
    { transaction }
  );

  if (indexes.length > 0) {
    const indexName = indexes[0].Key_name;
    await queryInterface.removeIndex('users', indexName, { transaction });
  }
};

export default { up, down };

