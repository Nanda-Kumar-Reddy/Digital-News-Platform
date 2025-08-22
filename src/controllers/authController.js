import bcrypt from 'bcrypt';
import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK, signToken, sanitize } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, interests = [] } = req.body;
    const ema = sanitize(email);
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(ema);
    if (exists) return res.status(409).json(JSON_ERR('Email already registered', 'AUTH_409'));

    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(sanitize(name), ema, hash, sanitize(phone || null));

    
    db.prepare('INSERT OR IGNORE INTO notification_settings (user_id) VALUES (?)').run(info.lastInsertRowid);

    const token = signToken({ id: info.lastInsertRowid, email: ema });
    return res.status(201).json(JSON_OK({
      message: 'User registered successfully',
      userId: info.lastInsertRowid,
      token
    }));
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json(JSON_ERR('Failed to register', 'AUTH_500'));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(sanitize(email));
    if (!user) return res.status(401).json(JSON_ERR('Invalid credentials', 'AUTH_401'));
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json(JSON_ERR('Invalid credentials', 'AUTH_401'));

    const token = signToken({ id: user.id, email: user.email });
    return res.status(200).json(JSON_OK({
      token,
      user: { id: user.id, name: user.name, email: user.email, isPremium: !!user.is_premium }
    }));
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json(JSON_ERR('Login failed', 'AUTH_500'));
  }
};

export const socialLogin = async (req, res) => {
  try {
    const { provider, token } = req.body;
    
    if (!provider || !token) return res.status(400).json(JSON_ERR('Invalid social login', 'AUTH_400'));

    
    const email = `social_${provider}_${token.slice(0,8)}@example.com`;
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      const hash = await bcrypt.hash('social-login', 10);
      const info = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      ).run(`Social ${provider}`, email, hash);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      db.prepare('INSERT OR IGNORE INTO notification_settings (user_id) VALUES (?)').run(user.id);
    }
    const jwtToken = signToken({ id: user.id, email: user.email });
    return res.status(200).json(JSON_OK({ token: jwtToken }));
  } catch (e) {
    console.error('Social login error:', e);
    return res.status(500).json(JSON_ERR('Social login failed', 'AUTH_500'));
  }
};
