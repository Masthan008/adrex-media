import express from 'express';
import { getCampaigns, createCampaign, deleteCampaign } from '../controllers/campaignController';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.delete('/:id', deleteCampaign);

export default router;
