import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';

export const getEpaperEditions = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT date, city, pages, download_url
      FROM epaper_editions
      ORDER BY date DESC
    `).all();

    if (!rows || rows.length === 0) {
      return res.status(200).json(JSON_OK({ editions: [] }));
    }

    
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.date]) {
        grouped[row.date] = [];
      }
      grouped[row.date].push({
        name: row.city,
        pages: row.pages,
        downloadUrl: row.download_url
      });
    });

    const editions = Object.keys(grouped).map(date => ({
      date,
      cities: grouped[date]
    }));

    return res.status(200).json(JSON_OK({ editions }));
  } catch (e) {
    console.error('E-paper fetch error:', e);
    return res.status(500).json(JSON_ERR('Failed to fetch e-paper editions', 'EPAPER_500'));
  }
};
