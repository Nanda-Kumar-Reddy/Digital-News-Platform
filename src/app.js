import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { runSchemaIfNeeded } from './config/database.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import bookmarkRouter from "./routes/bookmarkRoutes.js";
import pollRouter from './routes/pollRoutes.js'; 
import epaperRouter from './routes/epaperRoutes.js';
import notificationsRouter from './routes/notificationRoutes.js';

dotenv.config();
runSchemaIfNeeded();

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));


const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/search', searchRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use('/api/polls', pollRouter);
app.use('/api/epaper', epaperRouter);
app.use('/api/notifications', notificationsRouter);


app.get('/health', (req, res) => res.json({ ok: true }));


app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});
