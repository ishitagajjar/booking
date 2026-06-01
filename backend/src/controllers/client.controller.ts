import { Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';

const clientService = new ClientService();

export class ClientController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search } = req.query as Record<string, string>;
      const result = await clientService.getAll(req.userId!, parseInt(page), parseInt(limit), search);
      ApiResponse.success(res, result, 'Clients retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getById(req.params.id, req.userId!);
      ApiResponse.success(res, client, 'Client retrieved');
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.create(req.userId!, req.body);
      ApiResponse.success(res, client, 'Client created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.update(req.params.id, req.userId!, req.body);
      ApiResponse.success(res, client, 'Client updated');
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await clientService.delete(req.params.id, req.userId!);
      ApiResponse.success(res, null, 'Client deleted');
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }
}
