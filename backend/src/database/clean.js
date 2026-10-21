import sequelize from '../config/database.js';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';

export const cleanDatabase = async (includeMeta = false) => {
  try {
    logger.info('Connecting to database to clear tables...');
    const [tables] = await sequelize.query('SHOW TABLES');
    
    const tableNames = tables
      .map((t) => Object.values(t)[0])
      .filter((name) => includeMeta || name !== 'SequelizeMeta');

    if (tableNames.length === 0) {
      logger.info('No tables found to clear.');
      return;
    }

    // Disable foreign key constraints during truncate to avoid FK constraint errors
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tableNames) {
      logger.info(`Clearing data from table: ${table}`);
      await sequelize.query(`TRUNCATE TABLE \`${table}\``);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    logger.info('All data successfully deleted from the database. Table schemas remain intact.');
  } catch (error) {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    logger.error(`Error clearing database: ${error.message}`);
    throw error;
  }
};

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const includeMeta = process.argv.includes('--all') || process.argv.includes('--drop-meta');
  cleanDatabase(includeMeta)
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export default cleanDatabase;

