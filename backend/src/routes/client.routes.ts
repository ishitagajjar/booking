import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();
const controller = new ClientController();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();
const idParam = z.object({ id: z.string().uuid() });

router.use(authenticate);

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', validate({ params: idParam }), (req, res, next) => controller.getById(req, res, next));
router.post('/', validate({ body: createSchema }), (req, res, next) => controller.create(req, res, next));
router.put('/:id', validate({ params: idParam, body: updateSchema }), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validate({ params: idParam }), (req, res, next) => controller.delete(req, res, next));

export default router;
