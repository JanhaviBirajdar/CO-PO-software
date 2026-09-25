// ============================================================
// User Routes
// ============================================================

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/',      isAdmin, UserController.getAll);
router.get('/:id',   isAdmin, UserController.getById);
router.post('/',     isAdmin, validate(createUserSchema), UserController.create);
router.put('/:id',   isAdmin, validate(updateUserSchema), UserController.update);
router.delete('/:id', isAdmin, UserController.delete);

export default router;
