import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';

export const getPlans = (req, res) => {
  try {
    const plans = db.prepare('SELECT id, name, price, duration_days AS durationDays, features FROM plans').all();
    return res.status(200).json(JSON_OK({ plans }));
  } catch (e) {
    console.error('Plans error:', e);
    return res.status(500).json(JSON_ERR('Failed to load plans', 'PLANS_500'));
  }
};

export const subscribe = (req, res) => {
  try {
    const { planId } = req.body;
    const p = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId);
    if (!p) return res.status(404).json(JSON_ERR('Plan not found', 'PLAN_404'));

    const start = db.prepare(`SELECT datetime('now') AS d`).get().d;
    const end = db.prepare(`SELECT datetime('now', '+${p.duration_days} days') AS d`).get().d;

    const txId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    db.prepare('INSERT INTO payments (user_id, plan_id, amount, txn_id, status) VALUES (?,?,?,?,?)')
      .run(req.user.id, planId, p.price, txId, 'success');

    db.prepare('INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?,?,?,?,?)')
      .run(req.user.id, planId, start, end, 'active');

    db.prepare('UPDATE users SET is_premium = 1 WHERE id = ?').run(req.user.id);

    return res.status(201).json(JSON_OK({ message: 'Subscribed', txnId: txId, startDate: start, endDate: end }));
  } catch (e) {
    console.error('Subscribe error:', e);
    return res.status(500).json(JSON_ERR('Failed to subscribe', 'SUB_500'));
  }
};

export const status = (req, res) => {
  try {
    const sub = db.prepare(`
      SELECT s.id, s.status, s.start_date AS startDate, s.end_date AS endDate, p.name AS planName
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
      ORDER BY s.id DESC
      LIMIT 1
    `).get(req.user.id);

    const isPremium = !!db.prepare('SELECT is_premium AS p FROM users WHERE id = ?').get(req.user.id)?.p;
    return res.status(200).json(JSON_OK({ isPremium, subscription: sub || null }));
  } catch (e) {
    console.error('Status error:', e);
    return res.status(500).json(JSON_ERR('Failed to get status', 'SUB_STATUS_500'));
  }
};
