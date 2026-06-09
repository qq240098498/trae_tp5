import { Router } from 'express';
import { storeApi } from '../data/store';

const router = Router();

router.get('/stats', (_req, res) => {
  res.json(storeApi.getDashboardStats());
});

export default router;
