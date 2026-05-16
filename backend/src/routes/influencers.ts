import express from 'express';
import { getInfluencers, createInfluencer, updateInfluencer, deleteInfluencer } from '../controllers/influencerController';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/', getInfluencers);
router.post('/', createInfluencer);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

export default router;
