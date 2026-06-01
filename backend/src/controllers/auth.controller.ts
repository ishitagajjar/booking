import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { config } from '../config';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiryMs,
      });

      ApiResponse.success(res, { user: result.user, accessToken: result.accessToken }, 'Registration successful', 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        ApiResponse.error(res, error.message, 409);
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiryMs,
      });

      ApiResponse.success(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        ApiResponse.error(res, error.message, 401);
        return;
      }
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        ApiResponse.error(res, 'Refresh token required', 401);
        return;
      }

      const result = await authService.refresh(oldRefreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.refreshTokenExpiryMs,
      });

      ApiResponse.success(res, { accessToken: result.accessToken }, 'Token refreshed');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid or expired refresh token') {
        res.clearCookie('refreshToken');
        ApiResponse.error(res, error.message, 401);
        return;
      }
      next(error);
    }
  }
}
