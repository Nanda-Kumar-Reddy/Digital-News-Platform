import { JSON_ERR } from '../utils/helpers.js';

export function notFound(req, res) {
  return res.status(404).json(JSON_ERR('Resource not found', 'NOT_FOUND'));
}

export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);
  if (res.headersSent) return next(err);
  return res.status(500).json(JSON_ERR('Internal Server Error', 'SERVER_500'));
}
