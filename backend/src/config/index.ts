import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
  accessTokenExpiry: 15 * 60,           // 15 minutes in seconds
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  refreshTokenExpiryMs: 7 * 24 * 60 * 60 * 1000,
  bcryptRounds: 10,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  groq: {
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
};
