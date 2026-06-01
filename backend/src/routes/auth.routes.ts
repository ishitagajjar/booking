import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();
const controller = new AuthController();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  businessName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validate({ body: registerSchema }), (req, res, next) => controller.register(req, res, next));
router.post('/login', validate({ body: loginSchema }), (req, res, next) => controller.login(req, res, next));
router.post('/logout', (req, res, next) => controller.logout(req, res, next));
router.post('/refresh', (req, res, next) => controller.refresh(req, res, next));

export default router;
