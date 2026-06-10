import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { Review } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { staffId, type, status } = req.query;
  res.json(
    storeApi.getReviews({
      staffId: staffId as string,
      type: type as string,
      status: status as string,
    })
  );
});

router.get('/summary', (req: Request, res: Response) => {
  const { staffId } = req.query;
  res.json(storeApi.getReviewSummary(staffId as string));
});

router.get('/:id', (req: Request, res: Response) => {
  const review = storeApi.getReview(req.params.id);
  if (!review) return res.status(404).json({ error: '评价不存在' });
  res.json(review);
});

router.post('/', (req: Request, res: Response) => {
  try {
    const review = storeApi.createReview(req.body as Omit<Review, 'id' | 'createdAt'>);
    res.status(201).json(review);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const review = storeApi.updateReview(req.params.id, req.body);
  if (!review) return res.status(404).json({ error: '评价不存在' });
  res.json(review);
});

router.delete('/:id', (req: Request, res: Response) => {
  storeApi.deleteReview(req.params.id);
  res.json({ success: true });
});

router.post('/:id/contact', (req: Request, res: Response) => {
  const review = storeApi.recordContact(req.params.id);
  if (!review) return res.status(404).json({ error: '评价不存在' });
  res.json(review);
});

export default router;
