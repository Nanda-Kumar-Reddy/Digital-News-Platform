import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';

export const getAuthor = (req, res) => {
  try {
    const { id } = req.params;
    const au = db.prepare(`
      SELECT id, name, designation, bio, profile_image AS profileImage, email, twitter,
             total_articles AS totalArticles, followers
      FROM authors WHERE id = ?
    `).get(id);
    if (!au) return res.status(404).json(JSON_ERR('Author not found', 'AUTHOR_404'));
    return res.status(200).json(JSON_OK({ author: au }));
  } catch (e) {
    console.error('Get author error:', e);
    return res.status(500).json(JSON_ERR('Failed to load author', 'AUTHOR_500'));
  }
};

export const getAuthorArticles = (req, res) => {
  try {
    const { id } = req.params;
    const rows = db.prepare(`
      SELECT a.id, a.headline, a.image_url AS imageUrl, a.published_at AS publishedAt
      FROM article_authors aa
      JOIN articles a ON a.id = aa.article_id
      WHERE aa.author_id = ?
      ORDER BY a.published_at DESC
      LIMIT 50
    `).all(id);
    return res.status(200).json(JSON_OK({ articles: rows }));
  } catch (e) {
    console.error('Author articles error:', e);
    return res.status(500).json(JSON_ERR('Failed to load author articles', 'AUTHOR_500'));
  }
};

export const followAuthor = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM authors WHERE id = ?').get(id);
    if (!exists) return res.status(404).json(JSON_ERR('Author not found', 'AUTHOR_404'));

    db.prepare('INSERT OR IGNORE INTO author_follows (user_id, author_id) VALUES (?,?)')
      .run(req.user.id, id);
    db.prepare('UPDATE authors SET followers = followers + 1 WHERE id = ?').run(id);

    return res.status(200).json(JSON_OK({ message: 'Followed' }));
  } catch (e) {
    console.error('Follow author error:', e);
    return res.status(500).json(JSON_ERR('Failed to follow', 'AUTHOR_500'));
  }
};
