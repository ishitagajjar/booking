import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiry,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
