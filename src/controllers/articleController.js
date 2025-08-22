import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK, paginate, sanitize } from '../utils/helpers.js';

export const feed = (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { offset, limit: lim, page: pg } = paginate(page, limit);

    
    const total = db.prepare('SELECT COUNT(1) AS c FROM articles').get().c;
    const articles = db.prepare(`
      SELECT a.id, a.headline, a.summary, c.name AS category, a.published_at AS publishedAt,
             a.image_url AS imageUrl, a.is_premium AS isPremium, a.view_count AS viewCount
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      ORDER BY a.published_at DESC, a.view_count DESC
      LIMIT ? OFFSET ?
    `).all(lim, offset);

    
    const authorStmt = db.prepare(`
      SELECT au.id, au.name
      FROM article_authors aa
      JOIN authors au ON au.id = aa.author_id
      WHERE aa.article_id = ? AND aa.is_primary = 1
      LIMIT 1
    `);
    const result = articles.map(a => {
      const author = authorStmt.get(a.id) || null;
      return { ...a, author };
    });

    return res.status(200).json(JSON_OK({
      page: pg,
      totalPages: Math.ceil(total / lim),
      articles: result
    }));
  } catch (e) {
    console.error('Feed error:', e);
    return res.status(500).json(JSON_ERR('Failed to load feed', 'FEED_500'));
  }
};

export const trending = (req, res) => {
  try {
    
    const { timeframe = '24h' } = req.query;
    const rows = db.prepare(`
      SELECT id, headline, (SELECT name FROM categories WHERE id = category_id) AS category,
             image_url AS imageUrl, view_count AS viewsInTimeframe
      FROM articles
      ORDER BY view_count DESC
      LIMIT 20
    `).all();
    const list = rows.map((r, i) => ({ ...r, trendingRank: i + 1 }));
    return res.status(200).json(JSON_OK({ trending: list }));
  } catch (e) {
    console.error('Trending error:', e);
    return res.status(500).json(JSON_ERR('Failed to load trending', 'TRENDING_500'));
  }
};

export const breaking = (req, res) => {
  try {
    const now = db.prepare(`SELECT datetime('now') AS n`).get().n;
    const rows = db.prepare(`
      SELECT id, title, article_id AS articleId, priority, push, expires_at AS expiresAt
      FROM breaking_news
      WHERE expires_at IS NULL OR expires_at > datetime('now')
      ORDER BY priority DESC, id DESC
      LIMIT 20
    `).all();
    return res.status(200).json(JSON_OK({ breaking: rows, now }));
  } catch (e) {
    console.error('Breaking error:', e);
    return res.status(500).json(JSON_ERR('Failed to load breaking news', 'BREAKING_500'));
  }
};

export const getArticle = (req, res) => {
  try {
    const { id } = req.params;
    const art = db.prepare(`
      SELECT a.*, c.name AS category, (SELECT name FROM subcategories WHERE id = a.subcategory_id) AS subcategory
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      WHERE a.id = ?
    `).get(id);

    if (!art) return res.status(404).json(JSON_ERR('Article not found', 'ARTICLE_404'));

    const authors = db.prepare(`
      SELECT au.id, au.name, au.designation, au.profile_image AS profileImage
      FROM article_authors aa
      JOIN authors au ON au.id = aa.author_id
      WHERE aa.article_id = ?
      ORDER BY aa.is_primary DESC
    `).all(id);

    const tags = db.prepare(`
      SELECT t.name FROM article_tags at
      JOIN tags t ON t.id = at.tag_id
      WHERE at.article_id = ?
    `).all(id).map(t => t.name);

    const related = db.prepare(`
      SELECT id, headline, image_url AS imageUrl
      FROM articles
      WHERE category_id = ? AND id != ?
      ORDER BY published_at DESC
      LIMIT 6
    `).all(art.category_id, id);

    const article = {
      id: art.id,
      headline: art.headline,
      subheadline: art.subheadline,
      content: art.content,
      category: art.category,
      subcategory: art.subcategory,
      authors,
      publishedAt: art.published_at,
      updatedAt: art.updated_at,
      tags,
      imageUrl: art.image_url,
      imageCaption: art.image_caption,
      viewCount: art.view_count,
      isPremium: !!art.is_premium,
      relatedArticles: related
    };

    return res.status(200).json(JSON_OK({ article }));
  } catch (e) {
    console.error('Get article error:', e);
    return res.status(500).json(JSON_ERR('Failed to load article', 'ARTICLE_500'));
  }
};

export const trackView = (req, res) => {
  try {
    const { id } = req.params;
    const exists = db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
    if (!exists) return res.status(404).json(JSON_ERR('Article not found', 'ARTICLE_404'));

    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(id);

    
    if (req.user?.id) {
      db.prepare(`
        INSERT INTO reading_history (user_id, article_id, read_seconds)
        VALUES (?, ?, ?)
      `).run(req.user.id, id, 0);
    }
    return res.status(200).json(JSON_OK({ message: 'View tracked' }));
  } catch (e) {
    console.error('Track view error:', e);
    return res.status(500).json(JSON_ERR('Failed to track view', 'VIEW_500'));
  }
};

export const getComments = (req, res) => {
  try {
    const { id } = req.params;
    const rows = db.prepare(`
      SELECT c.id, c.comment, c.created_at AS timestamp, c.upvotes, c.downvotes,
             u.name AS user_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.article_id = ? AND c.parent_id IS NULL AND c.status = 'visible'
      ORDER BY c.created_at DESC
      LIMIT 100
    `).all(id);

    const repliesStmt = db.prepare(`
      SELECT c.id, c.comment, c.created_at AS timestamp, c.upvotes, c.downvotes,
             u.name AS user_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.parent_id = ? AND c.status = 'visible'
      ORDER BY c.created_at ASC
    `);

    const comments = rows.map(r => ({
      id: r.id,
      user: { name: r.user_name },
      comment: r.comment,
      timestamp: r.timestamp,
      upvotes: r.upvotes,
      downvotes: r.downvotes,
      replies: repliesStmt.all(r.id).map(x => ({
        id: x.id,
        user: { name: x.user_name },
        comment: x.comment,
        timestamp: x.timestamp,
        upvotes: x.upvotes,
        downvotes: x.downvotes
      }))
    }));

    return res.status(200).json(JSON_OK({ comments }));
  } catch (e) {
    console.error('Get comments error:', e);
    return res.status(500).json(JSON_ERR('Failed to load comments', 'COMMENTS_500'));
  }
};
