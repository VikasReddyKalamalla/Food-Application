import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

// Safe URI string with credentials masked for logs
const getSafeMongoUri = (uri) => {
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return '[PROTECTED_MONGODB_URI]';
  }
};

let isConnected = false;

/**
 * Configure Mongoose settings and attach lifecycle listeners
 */
const configureMongooseEvents = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info({ db: mongoose.connection.name }, 'MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    logger.error({ err: err.message }, 'MongoDB connection error occurred');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('MongoDB reconnected');
  });
};

/**
 * Connect to MongoDB with timeout and lifecycle handling
 * @param {string} [uri]
 * @param {import('mongoose').ConnectOptions} [customOptions]
 */
export const connectDatabase = async (uri = env.MONGODB_URI, customOptions = {}) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  configureMongooseEvents();

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20,
    minPoolSize: 2,
    autoIndex: env.isDevelopment,
    ...customOptions,
  };

  const safeUri = getSafeMongoUri(uri);
  logger.info({ uri: safeUri }, 'Attempting MongoDB connection...');

  try {
    await mongoose.connect(uri, options);
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    logger.error(
      { error: error.message, uri: safeUri },
      'Failed to connect to MongoDB'
    );
    throw error;
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    logger.info('Closing MongoDB connection...');
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed gracefully');
  }
};

/**
 * Check database connectivity and health
 */
export const getDatabaseHealth = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = states[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  return {
    status: state,
    isHealthy,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

export default {
  connectDatabase,
  disconnectDatabase,
  getDatabaseHealth,
};
