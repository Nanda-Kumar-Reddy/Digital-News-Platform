import { JSON_ERR } from '../utils/helpers.js';

export function requireFields(fields = []) {
  return (req, res, next) => {
    for (const f of fields) {
      if (req.body[f] === undefined || req.body[f] === null || req.body[f] === '') {
        return res.status(400).json(JSON_ERR(`Missing field: ${f}`, 'VALIDATION_400'));
      }
    }
    next();
  };
}
