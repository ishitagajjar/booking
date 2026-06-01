import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();
const controller = new InvoiceController();

const createSchema = z.object({
  clientId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  taxRate: z.number().nonnegative().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
  taxRate: z.number().nonnegative().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).optional(),
});

const idParam = z.object({ id: z.string().uuid() });

router.use(authenticate);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', validate({ params: idParam }), (req, res, next) => controller.getById(req, res, next));
router.get('/:id/pdf', validate({ params: idParam }), (req, res, next) => controller.exportPDF(req, res, next));
router.post('/', validate({ body: createSchema }), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validate({ params: idParam, body: updateSchema }), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validate({ params: idParam }), (req, res, next) => controller.delete(req, res, next));

export default router;
