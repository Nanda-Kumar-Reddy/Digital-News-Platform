
import { Router } from 'express';
import { saveBookmark, getBookmarks, deleteBookmark } from "../controllers/bookmarkController.js";
import { authenticate } from '../middleware/auth.js';

const bookmarkRouter = Router();

bookmarkRouter.post("/", authenticate, saveBookmark);
bookmarkRouter.get("/", authenticate, getBookmarks);
bookmarkRouter.delete("/:articleId", authenticate, deleteBookmark);

export default bookmarkRouter;
