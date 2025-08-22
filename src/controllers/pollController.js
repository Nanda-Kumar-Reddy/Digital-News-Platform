import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';


export const getActivePolls = (req, res) => {
  try {
    const polls = db.prepare('SELECT * FROM polls WHERE active = 1').all();
    if (!polls.length) {
      return res.json(JSON_OK({ polls: [] }));
    }

    const pollIds = polls.map(p => p.id);
    const placeholders = pollIds.map(() => '?').join(',');
    const options = db.prepare(`SELECT * FROM poll_options WHERE poll_id IN (${placeholders})`).all(...pollIds);

    const pollsWithOptions = polls.map(poll => {
      const pollOptions = options.filter(opt => opt.poll_id === poll.id);
      const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

      return {
        id: poll.id,
        question: poll.question,
        options: pollOptions.map(opt => ({
          id: opt.id,
          text: opt.text,
          percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
        })),
        totalVotes,
        hasVoted: false 
      };
    });

    return res.json(JSON_OK({ polls: pollsWithOptions }));
  } catch (e) {
    console.error('Get active polls error:', e);
    return res.status(500).json(JSON_ERR('Failed to fetch polls', 'POLL_FETCH_500'));
  }
};


export const voteInPoll = (req, res) => {
  try {
    const userId = req.user.id;
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;

    console.log('Voting in poll:', { userId, pollId, optionId });
    if (!optionId) return res.status(400).json(JSON_ERR('Option ID is required', 'OPTION_REQUIRED'));

    
    const pollExists = db.prepare('SELECT id FROM polls WHERE id = ? AND active = 1').get(pollId);
    if (!pollExists) return res.status(404).json(JSON_ERR('Poll not found', 'POLL_404'));

    
    const optionExists = db.prepare('SELECT id FROM poll_options WHERE id = ? AND poll_id = ?').get(optionId, pollId);
    if (!optionExists) return res.status(400).json(JSON_ERR('Invalid option', 'OPTION_INVALID'));

    
    const existingVote = db.prepare('SELECT * FROM poll_votes WHERE user_id = ? AND poll_id = ?').get(userId, pollId);
    if (existingVote) return res.status(400).json(JSON_ERR('You have already voted in this poll', 'ALREADY_VOTED'));

    
    db.prepare(`
      INSERT INTO poll_votes (user_id, poll_id, option_id) 
      VALUES (?, ?, ?)
    `).run(userId, pollId, optionId);

    
    db.prepare('UPDATE poll_options SET votes = votes + 1 WHERE id = ?').run(optionId);

    return res.status(201).json(JSON_OK({ message: 'Vote submitted successfully' }));
  } catch (e) {
    console.error('Vote error:', e);
    return res.status(500).json(JSON_ERR('Failed to submit vote', 'VOTE_500'));
  }
};
