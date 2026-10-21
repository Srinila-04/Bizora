import { Sequelize } from 'sequelize';
import config from './env.js';
import logger from '../utils/logger.js';

const isDev = config.nodeEnv === 'development';

const dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  };
}

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: isDev ? (msg) => logger.debug(msg) : false,
    pool: config.database.pool,
    dialectOptions,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    timezone: '+00:00'
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Successfully connected to MySQL database: ${config.database.name}`);
    return true;
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.message}`);
    throw error;
  }
};

export default sequelize;

