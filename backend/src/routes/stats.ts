import express from 'express';
import { getDashboardStats, getReportStats } from '../controllers/statsController';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', getDashboardStats);
router.get('/reports', getReportStats);

export default router;
