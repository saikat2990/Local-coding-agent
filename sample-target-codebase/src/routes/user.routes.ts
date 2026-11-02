import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate';
import { validateCreateUser, validateUpdateUser } from '../validators/user.validator';

const router = Router();

router.get('/', asyncHandler(userController.list));
router.get('/:id', asyncHandler(userController.getById));
router.post('/', validate(validateCreateUser), asyncHandler(userController.create));
router.patch('/:id', validate(validateUpdateUser), asyncHandler(userController.update));
router.delete('/:id', asyncHandler(userController.remove));

export default router;
