/**
 * Environment configuration
 */

export const env = {
  NODE_ENV: import.meta.env.MODE || "development",
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  WS_URL: import.meta.env.VITE_WS_URL || "ws://localhost:8000",
  APP_NAME: import.meta.env.VITE_APP_NAME || "SaaS Starter",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

