import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { Customer } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(storeApi.getCustomers());
});

router.get('/:id', (req: Request, res: Response) => {
  const c = storeApi.getCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: '客户不存在' });
  res.json(c);
});

router.post('/', (req: Request, res: Response) => {
  const c = storeApi.createCustomer(
    req.body as Omit<Customer, 'id' | 'createdAt' | 'totalSpent'>
  );
  res.status(201).json(c);
});

router.put('/:id', (req: Request, res: Response) => {
  const c = storeApi.updateCustomer(req.params.id, req.body);
  if (!c) return res.status(404).json({ error: '客户不存在' });
  res.json(c);
});

router.delete('/:id', (req: Request, res: Response) => {
  storeApi.deleteCustomer(req.params.id);
  res.json({ success: true });
});

export default router;
