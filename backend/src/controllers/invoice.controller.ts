import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvoiceService } from '../services/invoice.service';
import { ApiResponse } from '../utils/apiResponse';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

const invoiceService = new InvoiceService();

export class InvoiceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query as Record<string, string>;
      const result = await invoiceService.getAll(req.userId!, parseInt(page), parseInt(limit), search, status);
      ApiResponse.success(res, result, 'Invoices retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getById(req.params.id, req.userId!);
      ApiResponse.success(res, invoice, 'Invoice retrieved');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.create(req.userId!, req.body);
      ApiResponse.success(res, invoice, 'Invoice created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.update(req.params.id, req.userId!, req.body);
      ApiResponse.success(res, invoice, 'Invoice updated');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async exportPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getById(req.params.id, req.userId!);
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { name: true, businessName: true, email: true, phone: true },
      });

      if (!user) {
        ApiResponse.error(res, 'User not found', 404);
        return;
      }

      const pdfData = {
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        status: invoice.status,
        client: invoice.client!,
        user,
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        notes: invoice.notes,
      };

      const stream = generateInvoicePDF(pdfData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await invoiceService.delete(req.params.id, req.userId!);
      ApiResponse.success(res, null, 'Invoice deleted');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        ApiResponse.error(res, error.message, 404);
        return;
      }
      next(error);
    }
  }
}
