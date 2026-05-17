import express from 'express';
import {
  generateCampaignIdea,
  generateCaption,
  generateOutreachMessage,
  generateStrategy,
  chatWithAI,
  getChatHistory,
  deleteChat,
} from '../controllers/aiController';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();
router.use(requireAuth);

router.get('/history', getChatHistory);
router.delete('/history/:id', deleteChat);
router.post('/campaign-idea', generateCampaignIdea);
router.post('/caption', generateCaption);
router.post('/outreach', generateOutreachMessage);
router.post('/strategy', generateStrategy);
router.post('/chat', chatWithAI);

export default router;
