import { Router } from 'express';
import { requireFields } from '../middleware/validation.js';
import { register, login, socialLogin } from '../controllers/authController.js';

const authRoutes = Router();

authRoutes.post('/register', requireFields(['name','email','password']), register);
authRoutes.post('/login', requireFields(['email','password']), login);
authRoutes.post('/social-login', requireFields(['provider','token']), socialLogin);

export default authRoutes;
