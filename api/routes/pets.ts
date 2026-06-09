import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { Pet, Customer } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { customerId } = req.query;
  res.json(storeApi.getPets(customerId as string));
});

router.get('/:id', (req: Request, res: Response) => {
  const p = storeApi.getPet(req.params.id);
  if (!p) return res.status(404).json({ error: '宠物不存在' });
  res.json(p);
});

router.post('/', (req: Request, res: Response) => {
  const p = storeApi.createPet(req.body as Omit<Pet, 'id'>);
  res.status(201).json(p);
});

router.put('/:id', (req: Request, res: Response) => {
  const p = storeApi.updatePet(req.params.id, req.body);
  if (!p) return res.status(404).json({ error: '宠物不存在' });
  res.json(p);
});

router.delete('/:id', (req: Request, res: Response) => {
  storeApi.deletePet(req.params.id);
  res.json({ success: true });
});

export default router;
