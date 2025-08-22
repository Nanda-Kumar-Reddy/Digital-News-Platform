import { Router } from 'express';
import { getCategories, getCategoryArticles } from '../controllers/categoryController.js';

const categoryRoutes = Router();

categoryRoutes.get('/', getCategories);
categoryRoutes.get('/:slug/articles', getCategoryArticles);

export default categoryRoutes;
