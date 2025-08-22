import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import xss from 'xss';

dotenv.config();

export const JSON_OK = (data) => ({ success: true, ...data });
export const JSON_ERR = (message, code = 'ERROR') => ({ success: false, code, message });

export function sanitize(input) {
  if (typeof input === 'string') return xss(input.trim());
  return input;
}

export function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  return jwt.sign(payload, secret, { expiresIn });
}

export function paginate(page = 1, limit = 20) {
  const p = Math.max(parseInt(page || '1', 10), 1);
  const l = Math.min(Math.max(parseInt(limit || '20', 10), 1), 50);
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}
