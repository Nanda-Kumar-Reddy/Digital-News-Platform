import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK, sanitize } from '../utils/helpers.js';

export const postComment = (req, res) => {
  try {
    const { articleId, comment, parentId = null } = req.body;
    const userId = req.user.id;

    const art = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
    if (!art) return res.status(404).json(JSON_ERR('Article not found', 'ARTICLE_404'));

    const stmt = db.prepare(`
      INSERT INTO comments (article_id, user_id, parent_id, comment)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(articleId, userId, parentId, sanitize(comment));
    return res.status(201).json(JSON_OK({ id: info.lastInsertRowid }));
  } catch (e) {
    console.error('Post comment error:', e);
    return res.status(500).json(JSON_ERR('Failed to post comment', 'COMMENT_500'));
  }
};

export const voteComment = (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; 
    const v = vote === 'up' ? 1 : vote === 'down' ? -1 : 0;
    if (v === 0) return res.status(400).json(JSON_ERR('Invalid vote', 'VOTE_400'));
    const userId = req.user.id;

    const exists = db.prepare('SELECT id FROM comments WHERE id = ?').get(id);
    if (!exists) return res.status(404).json(JSON_ERR('Comment not found', 'COMMENT_404'));

    const had = db.prepare('SELECT vote FROM comment_votes WHERE user_id = ? AND comment_id = ?').get(userId, id);
    if (had) {
      
      if (had.vote === 1) {
        db.prepare('UPDATE comments SET upvotes = upvotes - 1 WHERE id = ?').run(id);
      } else {
        db.prepare('UPDATE comments SET downvotes = downvotes - 1 WHERE id = ?').run(id);
      }
      
      db.prepare('UPDATE comment_votes SET vote = ? WHERE user_id = ? AND comment_id = ?').run(v, userId, id);
    } else {
      db.prepare('INSERT INTO comment_votes (user_id, comment_id, vote) VALUES (?, ?, ?)').run(userId, id, v);
    }

    if (v === 1) {
      db.prepare('UPDATE comments SET upvotes = upvotes + 1 WHERE id = ?').run(id);
    } else {
      db.prepare('UPDATE comments SET downvotes = downvotes + 1 WHERE id = ?').run(id);
    }

    return res.status(200).json(JSON_OK({ message: 'Voted' }));
  } catch (e) {
    console.error('Vote error:', e);
    return res.status(500).json(JSON_ERR('Failed to vote', 'VOTE_500'));
  }
};
