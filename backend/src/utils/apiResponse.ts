import { Response } from 'express';
import { ApiResponseType } from '../types';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    const response: ApiResponseType<T> = {
      IsSuccess: true,
      Data: data,
      Message: message,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message = 'Something went wrong', statusCode = 500): Response {
    const response: ApiResponseType<null> = {
      IsSuccess: false,
      Data: null,
      Message: message,
    };
    return res.status(statusCode).json(response);
  }
}
