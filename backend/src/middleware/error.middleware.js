import { ValidationError as SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import multer from 'multer';
import { ApiError } from '../utils/apiError.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'An unexpected internal server error occurred';
  let code = 'INTERNAL_ERROR';
  let details = [];

  // Log error with request info safely
  logger.error(`[Error Handler] ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  } else if (err instanceof SequelizeValidationError || err instanceof UniqueConstraintError) {
    statusCode = 400;
    message = 'Database validation failed';
    code = 'VALIDATION_ERROR';
    details = err.errors ? err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value
    })) : [];
  } else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    message = 'Invalid reference: referenced entity does not exist or has active constraints';
    code = 'FOREIGN_KEY_VIOLATION';
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File exceeds the maximum allowed size of ${config.upload.maxSizeMb}MB`;
    } else {
      message = err.message;
    }
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    code = 'TOKEN_EXPIRED';
  }

  const responsePayload = {
    success: false,
    message,
    error: {
      code,
      details
    }
  };

  if (config.nodeEnv === 'development' && statusCode === 500) {
    responsePayload.error.debugStack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: []
    }
  });
};

export default {
  errorHandler,
  notFoundHandler
};

