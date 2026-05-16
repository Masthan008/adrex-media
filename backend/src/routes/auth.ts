import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';

const router = Router();

router.post('/signup', signup as any);
router.post('/login', login as any);
router.post('/logout', logout as any);

export default router;
