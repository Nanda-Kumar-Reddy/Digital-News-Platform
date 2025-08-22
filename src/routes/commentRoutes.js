import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireFields } from '../middleware/validation.js';
import { postComment, voteComment } from '../controllers/commentController.js';

const commentRoutes = Router();

commentRoutes.post('/', authenticate, requireFields(['articleId','comment']), postComment);
commentRoutes.post('/:id/vote', authenticate, requireFields(['vote']), voteComment);

export default commentRoutes;
