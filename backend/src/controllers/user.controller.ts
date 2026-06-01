import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.userId!);
      ApiResponse.success(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.userId!, req.body);
      ApiResponse.success(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.userId!, req.body.currentPassword, req.body.newPassword);
      ApiResponse.success(res, null, 'Password changed');
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        ApiResponse.error(res, error.message, 400);
        return;
      }
      next(error);
    }
  }
}
