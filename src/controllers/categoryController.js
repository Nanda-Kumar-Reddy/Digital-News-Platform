import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK, paginate } from '../utils/helpers.js';

export const getCategories = (req, res) => {
  try {
    const cats = db.prepare(`
      SELECT id, name, slug FROM categories ORDER BY priority DESC, name ASC
    `).all();

    const subStmt = db.prepare('SELECT name FROM subcategories WHERE category_id = ? ORDER BY name ASC');
    const categories = cats.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      subcategories: subStmt.all(c.id).map(s => s.name)
    }));
    return res.status(200).json(JSON_OK({ categories }));
  } catch (e) {
    console.error('Categories error:', e);
    return res.status(500).json(JSON_ERR('Failed to load categories', 'CATEGORIES_500'));
  }
};

export const getCategoryArticles = (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, subcategory = null } = req.query;
    
    const cat = db.prepare('SELECT id, name FROM categories WHERE slug = ?').get(slug);
    if (!cat) return res.status(404).json(JSON_ERR('Category not found', 'CATEGORY_404'));

    const { offset, limit: lim, page: pg } = paginate(page, limit);

    let where = 'a.category_id = ?';
    const params = [cat.id];
    if (subcategory) {
      where += ' AND a.subcategory_id = (SELECT id FROM subcategories WHERE category_id = ? AND name = ?)';
      params.push(cat.id, subcategory);
    }

    const total = db.prepare(`SELECT COUNT(1) AS c FROM articles a WHERE ${where}`).get(...params).c;
    const rows = db.prepare(`
      SELECT a.id, a.headline, a.summary, a.image_url AS imageUrl, a.published_at AS publishedAt
      FROM articles a
      WHERE ${where}
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, lim, offset);

    return res.status(200).json(JSON_OK({
      category: cat.name,
      page: pg,
      totalPages: Math.ceil(total / lim),
      articles: rows
    }));
  } catch (e) {
    console.error('Category articles error:', e);
    return res.status(500).json(JSON_ERR('Failed to load category articles', 'CATEGORY_500'));
  }
};
