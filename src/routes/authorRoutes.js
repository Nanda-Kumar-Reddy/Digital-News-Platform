import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAuthor, getAuthorArticles, followAuthor } from '../controllers/authorController.js';

const authorRoutes = Router();

authorRoutes.get('/:id', getAuthor);
authorRoutes.get('/:id/articles', getAuthorArticles);
authorRoutes.post('/:id/follow', authenticate, followAuthor);

export default authorRoutes;
