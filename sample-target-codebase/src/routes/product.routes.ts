import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { validateCreateProduct, validateUpdateProduct } from '../validators/product.validator';

const router = Router();

router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.getById));
router.post('/', validate(validateCreateProduct), asyncHandler(productController.create));
router.patch('/:id', validate(validateUpdateProduct), asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));

export default router;
