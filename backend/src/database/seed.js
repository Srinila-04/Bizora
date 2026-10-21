import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedersDir = path.resolve(__dirname, 'seeders');

const getSeederFiles = () => {
  if (!fs.existsSync(seedersDir)) return [];
  return fs
    .readdirSync(seedersDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
};

export const seedUp = async () => {
  logger.info('Starting database seeding...');
  const files = getSeederFiles();

  if (files.length === 0) {
    logger.info('No seeders found.');
    return;
  }

  const queryInterface = sequelize.getQueryInterface();
  const { Sequelize } = sequelize.constructor;

  for (const file of files) {
    logger.info(`Applying seeder: ${file}`);
    const filePath = path.resolve(seedersDir, file);
    const seeder = await import(`file://${filePath}`);
    const upFn = seeder.up || (seeder.default && seeder.default.up);

    if (typeof upFn !== 'function') {
      throw new Error(`Seeder ${file} does not export an up() function.`);
    }

    const transaction = await sequelize.transaction();
    try {
      await upFn(queryInterface, Sequelize, transaction);
      await transaction.commit();
      logger.info(`Successfully applied seeder: ${file}`);
    } catch (err) {
      await transaction.rollback();
      logger.error(`Failed to apply seeder ${file}: ${err.message}`);
      throw err;
    }
  }

  logger.info('Database seeding completed successfully.');
};

export const seedDown = async () => {
  logger.info('Reverting database seeders...');
  const files = getSeederFiles().reverse();

  if (files.length === 0) {
    logger.info('No seeders to revert.');
    return;
  }

  const queryInterface = sequelize.getQueryInterface();
  const { Sequelize } = sequelize.constructor;

  for (const file of files) {
    logger.info(`Reverting seeder: ${file}`);
    const filePath = path.resolve(seedersDir, file);
    const seeder = await import(`file://${filePath}`);
    const downFn = seeder.down || (seeder.default && seeder.default.down);

    if (typeof downFn !== 'function') {
      throw new Error(`Seeder ${file} does not export a down() function.`);
    }

    const transaction = await sequelize.transaction();
    try {
      await downFn(queryInterface, Sequelize, transaction);
      await transaction.commit();
      logger.info(`Successfully reverted seeder: ${file}`);
    } catch (err) {
      await transaction.rollback();
      logger.error(`Failed to revert seeder ${file}: ${err.message}`);
      throw err;
    }
  }

  logger.info('All seeders reverted.');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'up';
  (async () => {
    try {
      if (command === 'up') {
        await seedUp();
      } else if (command === 'down') {
        await seedDown();
      } else {
        logger.error(`Unknown command: ${command}. Use 'up' or 'down'.`);
        process.exit(1);
      }
      await sequelize.close();
      process.exit(0);
    } catch (err) {
      logger.error(`Seeding error: ${err.message}`);
      await sequelize.close();
      process.exit(1);
    }
  })();
}

export default {
  seedUp,
  seedDown
};

