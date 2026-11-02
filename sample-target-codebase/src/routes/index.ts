// Mount every feature router here. Add new resources by creating
// routes/<name>.routes.ts and registering it below.
import { Router } from 'express';
import { health } from '../controllers/health.controller';
import userRoutes from './user.routes';
import productRoutes from './product.routes';

const router = Router();

router.get('/health', health);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

export default router;
