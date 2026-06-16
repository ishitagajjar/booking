import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import serviceRoutes from './service.routes';
import bookingRoutes from './booking.routes';
import invoiceRoutes from './invoice.routes';
import userRoutes from './user.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/ai', aiRoutes);

export default router;
