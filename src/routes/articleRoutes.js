import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { feed, trending, breaking, getArticle, trackView, getComments } from '../controllers/articleController.js';

const articleRoutes = Router();

articleRoutes.get('/feed', feed);
articleRoutes.get('/trending', trending);
articleRoutes.get('/breaking', breaking);

articleRoutes.get('/:id', getArticle);
articleRoutes.post('/:id/view', authenticate, trackView);
articleRoutes.get('/:id/comments', getComments);

export default articleRoutes;
