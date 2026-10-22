import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);

router.get('/stats', (req, res, next) => controller.getStats(req, res, next));

export default router;
