import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats(req.userId!);
      ApiResponse.success(res, stats, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}
