import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();
const controller = new UserController();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.use(authenticate);

router.get('/profile', (req, res, next) => controller.getProfile(req, res, next));
router.put('/profile', validate({ body: updateProfileSchema }), (req, res, next) => controller.updateProfile(req, res, next));
router.put('/password', validate({ body: changePasswordSchema }), (req, res, next) => controller.changePassword(req, res, next));

export default router;
