import { Router } from 'express';
import { getActivePolls, voteInPoll } from '../controllers/pollController.js';
import { authenticate } from '../middleware/auth.js';


const pollRouter =  Router();


pollRouter.get('/active', getActivePolls);


pollRouter.post('/:id/vote', authenticate, voteInPoll);

export default pollRouter;
