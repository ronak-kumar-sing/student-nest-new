import getEnvVars from '@/config/env';

const env = getEnvVars();

export const API_CONFIG = {
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const APP_CONFIG = {
  name: env.APP_NAME,
  url: env.APP_URL,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
};

export const AUTH_CONFIG = {
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
};

// MongoDB configuration (if needed in the app)
export const DB_CONFIG = {
  uri: env.MONGODB_URI,
};