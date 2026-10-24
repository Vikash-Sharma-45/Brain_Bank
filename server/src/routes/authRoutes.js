import { Router } from 'express';
import * as authCtrl from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/me', authenticate, authCtrl.getMe);

export default router;
