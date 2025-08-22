import { Router } from 'express';
import { searchArticles } from "../controllers/searchController.js";
import { authenticate } from '../middleware/auth.js';

const searchRouter  = Router();

searchRouter.get("/", authenticate, searchArticles);

export default searchRouter;
