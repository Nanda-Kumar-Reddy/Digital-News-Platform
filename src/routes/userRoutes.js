import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireFields } from '../middleware/validation.js';
import {
  getPreferences, updatePreferences,
  addBookmark, getBookmarks, removeBookmark,
  getHistory
} from '../controllers/userController.js';

const userRoutes = Router();

userRoutes.get('/preferences', authenticate, getPreferences);
userRoutes.put('/preferences', authenticate, updatePreferences);

userRoutes.post('/bookmarks', authenticate, requireFields(['articleId']), addBookmark);
userRoutes.get('/bookmarks', authenticate, getBookmarks);
userRoutes.delete('/bookmarks/:articleId', authenticate, removeBookmark);

userRoutes.get('/history', authenticate, getHistory);

export default userRoutes;
