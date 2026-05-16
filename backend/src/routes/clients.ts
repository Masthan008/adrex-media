import express from 'express';
import { getClients, createClient, deleteClient } from '../controllers/clientController';
import { requireAuth } from '../middlewares/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/', getClients);
router.post('/', createClient);
router.delete('/:id', deleteClient);

export default router;
