import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireFields } from '../middleware/validation.js';
import { getPlans, subscribe, status } from '../controllers/subscriptionController.js';

const subscriptionRoutes = Router();

subscriptionRoutes.get('/plans', getPlans);
subscriptionRoutes.post('/subscribe', authenticate, requireFields(['planId']), subscribe);
subscriptionRoutes.get('/status', authenticate, status);

export default subscriptionRoutes;
