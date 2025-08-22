import { Router } from 'express';
import {getEpaperEditions} from '../controllers/epaperController.js';

const epaperRouter = Router();
epaperRouter.get('/editions', getEpaperEditions);

export default epaperRouter;
