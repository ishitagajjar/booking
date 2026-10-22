import dotenv from 'dotenv';

dotenv.config();

function normalizeFrontendUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

const nodeEnv = process.env.NODE_ENV || 'development';

// A missing secret in production would let anyone forge tokens with the public
// default value, so fail at startup instead. Defaults are for local dev only.
function requireSecret(name: string, devDefault: string): string {
  const value = process.env[name];
  if (value) return value;
  if (nodeEnv === 'production') {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return devDefault;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  accessTokenSecret: requireSecret('ACCESS_TOKEN_SECRET', 'default-access-secret'),
  refreshTokenSecret: requireSecret('REFRESH_TOKEN_SECRET', 'default-refresh-secret'),
  accessTokenExpiry: 15 * 60,           // 15 minutes in seconds
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000,
  bcryptRounds: 10,
  frontendUrl: normalizeFrontendUrl(process.env.FRONTEND_URL || 'http://localhost:5173'),
  groq: {
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
};
