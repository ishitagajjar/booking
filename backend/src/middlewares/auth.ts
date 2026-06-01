import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { config } from '../config';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/apiResponse';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponse.error(res, 'Access token required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token, config.accessTokenSecret);
    req.userId = payload.userId;
    next();
  } catch {
    ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};
