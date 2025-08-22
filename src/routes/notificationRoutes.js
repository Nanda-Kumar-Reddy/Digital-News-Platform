import { Router } from 'express';
import {
  getNotificationSettings,
  updateNotificationSettings,
  registerDevice
} from "../controllers/notificationController.js";
import { authenticate } from '../middleware/auth.js';

const notificationsRouter = Router();


notificationsRouter.get("/settings", authenticate, getNotificationSettings);


notificationsRouter.put("/settings", authenticate, updateNotificationSettings);


notificationsRouter.post("/register-device", authenticate, registerDevice);

export default notificationsRouter;
