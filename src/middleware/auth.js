import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JSON_ERR } from '../utils/helpers.js';
import { db } from '../config/database.js';

dotenv.config();

export function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    if (!token) {
      return res.status(401).json(JSON_ERR('Missing token', 'AUTH_401'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return res.status(401).json(JSON_ERR('Invalid token', 'AUTH_401'));
      req.user = payload;
      next();
    });
  } catch (e) {
    return res.status(401).json(JSON_ERR('Unauthorized', 'AUTH_401'));
  }
}

export function premiumRequired(req, res, next) {
  try {
    const { id } = req.user || {};
    const row = db.prepare('SELECT is_premium FROM users WHERE id = ?').get(id);
    if (!row) return res.status(401).json(JSON_ERR('Unauthorized', 'AUTH_401'));
    if (row.is_premium !== 1) {
      return res.status(403).json(JSON_ERR('Premium content/not subscribed', 'PREMIUM_403'));
    }
    next();
  } catch (e) {
    return res.status(500).json(JSON_ERR('Failed premium check', 'PREMIUM_500'));
  }
}
