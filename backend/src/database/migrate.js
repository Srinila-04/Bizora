import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, 'migrations');

const ensureMetaTable = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('SequelizeMeta')) {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true
      }
    });
    logger.info('Created SequelizeMeta table for migration tracking.');
  }
};

const getExecutedMigrations = async () => {
  await ensureMetaTable();
  const [results] = await sequelize.query('SELECT name FROM SequelizeMeta ORDER BY name ASC');
  return results.map((r) => r.name);
};

const getMigrationFiles = () => {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
};

export const migrateUp = async () => {
  logger.info('Starting database migrations (UP)...');
  await ensureMetaTable();
  const executed = await getExecutedMigrations();
  const files = getMigrationFiles();
  const pending = files.filter((f) => !executed.includes(f));

  if (pending.length === 0) {
    logger.info('No pending migrations found. Database is up to date.');
    return;
  }

  const queryInterface = sequelize.getQueryInterface();
  const { Sequelize } = sequelize.constructor;

  for (const file of pending) {
    logger.info(`Applying migration: ${file}`);
    const filePath = path.resolve(migrationsDir, file);
    const migration = await import(`file://${filePath}`);
    const upFn = migration.up || (migration.default && migration.default.up);

    if (typeof upFn !== 'function') {
      throw new Error(`Migration ${file} does not export an up() function.`);
    }

    const transaction = await sequelize.transaction();
    try {
      await upFn(queryInterface, Sequelize, transaction);
      await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
        replacements: [file],
        transaction
      });
      await transaction.commit();
      logger.info(`Successfully applied migration: ${file}`);
    } catch (err) {
      await transaction.rollback();
      logger.error(`Failed to apply migration ${file}: ${err.message}`);
      throw err;
    }
  }

  logger.info('All pending migrations applied successfully.');
};

export const migrateDown = async () => {
  logger.info('Reverting last database migration (DOWN)...');
  await ensureMetaTable();
  const executed = await getExecutedMigrations();

  if (executed.length === 0) {
    logger.info('No migrations to revert.');
    return;
  }

  const lastMigrationFile = executed[executed.length - 1];
  const filePath = path.resolve(migrationsDir, lastMigrationFile);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found on disk: ${lastMigrationFile}`);
  }

  logger.info(`Reverting migration: ${lastMigrationFile}`);
  const migration = await import(`file://${filePath}`);
  const downFn = migration.down || (migration.default && migration.default.down);

  if (typeof downFn !== 'function') {
    throw new Error(`Migration ${lastMigrationFile} does not export a down() function.`);
  }

  const queryInterface = sequelize.getQueryInterface();
  const { Sequelize } = sequelize.constructor;
  const transaction = await sequelize.transaction();
  try {
    await downFn(queryInterface, Sequelize, transaction);
    await sequelize.query('DELETE FROM SequelizeMeta WHERE name = ?', {
      replacements: [lastMigrationFile],
      transaction
    });
    await transaction.commit();
    logger.info(`Successfully reverted migration: ${lastMigrationFile}`);
  } catch (err) {
    await transaction.rollback();
    logger.error(`Failed to revert migration ${lastMigrationFile}: ${err.message}`);
    throw err;
  }
};

export const migrationStatus = async () => {
  await ensureMetaTable();
  const executed = await getExecutedMigrations();
  const files = getMigrationFiles();

  logger.info('=== Migration Status ===');
  for (const file of files) {
    const isApplied = executed.includes(file);
    const status = isApplied ? '[APPLIED]' : '[PENDING]';
    logger.info(`${status} ${file}`);
  }
  logger.info(`Total: ${files.length} migrations | Applied: ${executed.length} | Pending: ${files.length - executed.length}`);
};

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'up';
  (async () => {
    try {
      if (command === 'up') {
        await migrateUp();
      } else if (command === 'down') {
        await migrateDown();
      } else if (command === 'status') {
        await migrationStatus();
      } else {
        logger.error(`Unknown command: ${command}. Use 'up', 'down', or 'status'.`);
        process.exit(1);
      }
      await sequelize.close();
      process.exit(0);
    } catch (err) {
      logger.error(`Migration error: ${err.message}`);
      await sequelize.close();
      process.exit(1);
    }
  })();
}

export default {
  migrateUp,
  migrateDown,
  migrationStatus
};

