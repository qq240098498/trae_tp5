import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { MemberDiscount } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(storeApi.getMemberDiscounts());
});

router.get('/:id', (req: Request, res: Response) => {
  const d = storeApi.getMemberDiscount(req.params.id);
  if (!d) return res.status(404).json({ error: '折扣规则不存在' });
  res.json(d);
});

router.get('/level/:level', (req: Request, res: Response) => {
  const d = storeApi.getMemberDiscountByLevel(req.params.level as MemberDiscount['level']);
  if (!d) return res.status(404).json({ error: '该等级折扣规则不存在' });
  res.json(d);
});

router.post('/', (req: Request, res: Response) => {
  try {
    const d = storeApi.createMemberDiscount(
      req.body as Omit<MemberDiscount, 'id' | 'createdAt'>
    );
    res.status(201).json(d);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const d = storeApi.updateMemberDiscount(req.params.id, req.body as Partial<MemberDiscount>);
  if (!d) return res.status(404).json({ error: '折扣规则不存在' });
  res.json(d);
});

router.delete('/:id', (req: Request, res: Response) => {
  storeApi.deleteMemberDiscount(req.params.id);
  res.json({ success: true });
});

export default router;
