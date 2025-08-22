import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';

export const getPreferences = (req, res) => {
  try {
    const u = db.prepare('SELECT preferred_language FROM users WHERE id = ?').get(req.user.id);
    const s = db.prepare('SELECT * FROM notification_settings WHERE user_id = ?').get(req.user.id);
    return res.status(200).json(JSON_OK({
      preferredLanguage: u?.preferred_language || 'en',
      notifications: {
        breaking: !!s?.breaking,
        daily: !!s?.daily,
        personalized: !!s?.personalized
      }
    }));
  } catch (e) {
    console.error('Get prefs error:', e);
    return res.status(500).json(JSON_ERR('Failed to load preferences', 'PREF_500'));
  }
};

export const updatePreferences = (req, res) => {
  try {
    const { preferredLanguage = 'en', notifications = {} } = req.body;
    db.prepare('UPDATE users SET preferred_language = ? WHERE id = ?').run(preferredLanguage, req.user.id);

    const current = db.prepare('SELECT user_id FROM notification_settings WHERE user_id = ?').get(req.user.id);
    if (current) {
      db.prepare('UPDATE notification_settings SET breaking = ?, daily = ?, personalized = ? WHERE user_id = ?')
        .run(notifications.breaking ? 1 : 0, notifications.daily ? 1 : 0, notifications.personalized ? 1 : 0, req.user.id);
    } else {
      db.prepare('INSERT INTO notification_settings (user_id, breaking, daily, personalized) VALUES (?,?,?,?)')
        .run(req.user.id, notifications.breaking ? 1 : 0, notifications.daily ? 1 : 0, notifications.personalized ? 1 : 0);
    }
    return res.status(200).json(JSON_OK({ message: 'Preferences updated' }));
  } catch (e) {
    console.error('Update prefs error:', e);
    return res.status(500).json(JSON_ERR('Failed to update preferences', 'PREF_500'));
  }
};

export const addBookmark = (req, res) => {
  try {
    const { articleId, collectionId = null } = req.body;
    const a = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
    if (!a) return res.status(404).json(JSON_ERR('Article not found', 'ARTICLE_404'));
    db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, article_id, collection_id) VALUES (?,?,?)')
      .run(req.user.id, articleId, collectionId);
    return res.status(201).json(JSON_OK({ message: 'Saved' }));
  } catch (e) {
    console.error('Bookmark error:', e);
    return res.status(500).json(JSON_ERR('Failed to save bookmark', 'BOOKMARK_500'));
  }
};

export const getBookmarks = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT b.article_id AS articleId, a.headline, a.image_url AS imageUrl, a.published_at AS publishedAt
      FROM bookmarks b
      JOIN articles a ON a.id = b.article_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
    return res.status(200).json(JSON_OK({ bookmarks: rows }));
  } catch (e) {
    console.error('Get bookmarks error:', e);
    return res.status(500).json(JSON_ERR('Failed to load bookmarks', 'BOOKMARK_500'));
  }
};

export const removeBookmark = (req, res) => {
  try {
    const { articleId } = req.params;
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(req.user.id, articleId);
    return res.status(200).json(JSON_OK({ message: 'Removed' }));
  } catch (e) {
    console.error('Remove bookmark error:', e);
    return res.status(500).json(JSON_ERR('Failed to remove bookmark', 'BOOKMARK_500'));
  }
};

export const getHistory = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT h.article_id AS articleId, a.headline, h.read_seconds AS readSeconds, h.created_at AS timestamp
      FROM reading_history h
      JOIN articles a ON a.id = h.article_id
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC
      LIMIT 100
    `).all(req.user.id);

    return res.status(200).json(JSON_OK({ history: rows }));
  } catch (e) {
    console.error('History error:', e);
    return res.status(500).json(JSON_ERR('Failed to load history', 'HISTORY_500'));
  }
};
