import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';

export const saveBookmark = (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId, collectionId } = req.body;

    if (!articleId) {
      return res.status(400).json(JSON_ERR('Article ID is required', 'BOOKMARK_400'));
    }

    const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
    if (!article) {
      return res.status(404).json(JSON_ERR('Article not found', 'ARTICLE_404'));
    }

    if (collectionId) {
      const collection = db
        .prepare('SELECT id FROM bookmark_collections WHERE id = ? AND user_id = ?')
        .get(collectionId, userId);
      if (!collection) {
        return res.status(400).json(JSON_ERR('Invalid collection', 'BOOKMARK_COLLECTION_INVALID'));
      }
    }

    const stmt = db.prepare(`
      INSERT INTO bookmarks (user_id, article_id, collection_id)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, article_id)
      DO UPDATE SET collection_id = excluded.collection_id
    `);
    stmt.run(userId, articleId, collectionId || null);

    return res.status(201).json(JSON_OK({ message: 'Article bookmarked successfully' }));
  } catch (e) {
    return res.status(500).json(JSON_ERR('Failed to save bookmark', 'BOOKMARK_500'));
  }
};

export const getBookmarks = (req, res) => {
  try {
    const userId = req.user.id;
    const stmt = db.prepare(`
      SELECT b.article_id, a.headline AS title, c.name AS category, b.collection_id, bc.name AS collection_name, b.created_at
      FROM bookmarks b
      JOIN articles a ON b.article_id = a.id
      JOIN categories c ON a.category_id = c.id
      LEFT JOIN bookmark_collections bc ON b.collection_id = bc.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `);
    const bookmarks = stmt.all(userId);
    return res.status(200).json(JSON_OK({ total: bookmarks.length, bookmarks }));
  } catch (e) {
    return res.status(500).json(JSON_ERR('Failed to fetch bookmarks', 'BOOKMARK_FETCH_500'));
  }
};

export const deleteBookmark = (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(userId, articleId);
    return res.status(200).json(JSON_OK({ message: 'Bookmark removed' }));
  } catch (e) {
    return res.status(500).json(JSON_ERR('Failed to delete bookmark', 'BOOKMARK_DELETE_500'));
  }
};
