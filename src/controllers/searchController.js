import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK, paginate, sanitize } from '../utils/helpers.js';

export const searchArticles = async (req, res) => {
  try {
    const { q, category, dateFrom, dateTo, author } = req.query;


    let baseQuery = `
      SELECT a.*, u.name as authorName
      FROM articles a
      JOIN users u ON a.id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      baseQuery += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
      baseQuery += ` AND a.category = ?`;
      params.push(category);
    }

    if (dateFrom) {
      baseQuery += ` AND date(a.created_at) >= date(?)`;
      params.push(dateFrom);
    }

    if (dateTo) {
      baseQuery += ` AND date(a.created_at) <= date(?)`;
      params.push(dateTo);
    }

    if (author) {
      baseQuery += ` AND u.name LIKE ?`;
      params.push(`%${author}%`);
    }

    
    baseQuery += ` ORDER BY a.created_at DESC`;

    const articles = await db.prepare(baseQuery, params).all();

    return res.json(
      JSON_OK({
        query: q || "",
        totalResults: articles.length,
        articles,
      })
    );
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json(JSON_ERR("Failed to search articles", "SEARCH_500"));
  }
};
