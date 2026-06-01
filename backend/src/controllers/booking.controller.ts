import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../types';

const bookingService = new BookingService();

export class BookingController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query as Record<string, string>;
      const result = await bookingService.getAll(req.userId!, parseInt(page), parseInt(limit), search, status);
      ApiResponse.success(res, result, 'Bookings retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getById(req.params.id, req.userId!);
      ApiResponse.success(res, booking, 'Booking retrieved');
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.create(req.userId!, req.body);
      ApiResponse.success(res, booking, 'Booking created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.update(req.params.id, req.userId!, req.body);
      ApiResponse.success(res, booking, 'Booking updated');
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.delete(req.params.id, req.userId!);
      ApiResponse.success(res, null, 'Booking deleted');
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }
}
