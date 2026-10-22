import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { config } from '../config';

const authService = new AuthService();

// Browsers only delete a cookie when clearCookie uses the same options it was set with
const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/',
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, { ...REFRESH_COOKIE_OPTIONS, maxAge: config.refreshTokenExpiryMs });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      setRefreshCookie(res, result.refreshToken);

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

      setRefreshCookie(res, result.refreshToken);

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

      clearRefreshCookie(res);
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

      setRefreshCookie(res, result.refreshToken);

      ApiResponse.success(res, { accessToken: result.accessToken }, 'Token refreshed');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid or expired refresh token') {
        clearRefreshCookie(res);
        ApiResponse.error(res, error.message, 401);
        return;
      }
      next(error);
    }
  }
}
