import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema, registerSchema, refreshTokenSchema } from '../utils/validators.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authController.getProfile);

export default router;
