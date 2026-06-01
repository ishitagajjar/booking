import { Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';

const serviceService = new ServiceService();

export class ServiceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search } = req.query as Record<string, string>;
      const result = await serviceService.getAll(req.userId!, parseInt(page), parseInt(limit), search);
      ApiResponse.success(res, result, 'Services retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.getById(req.params.id, req.userId!);
      ApiResponse.success(res, service, 'Service retrieved');
    } catch (error) {
      if (error instanceof Error && error.message === 'Service not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.create(req.userId!, req.body);
      ApiResponse.success(res, service, 'Service created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.update(req.params.id, req.userId!, req.body);
      ApiResponse.success(res, service, 'Service updated');
    } catch (error) {
      if (error instanceof Error && error.message === 'Service not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await serviceService.delete(req.params.id, req.userId!);
      ApiResponse.success(res, null, 'Service deleted');
    } catch (error) {
      if (error instanceof Error && error.message === 'Service not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }
}
