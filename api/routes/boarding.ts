import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { BoardingOrder, PricingRule } from '../../shared/types';

const router = Router();

router.get('/orders', (req: Request, res: Response) => {
  const { status } = req.query;
  res.json(storeApi.getBoardingOrders(status as string));
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = storeApi.getBoardingOrder(req.params.id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  res.json(order);
});

router.post('/orders', (req: Request, res: Response) => {
  try {
    const order = storeApi.createBoardingOrder(
      req.body as Omit<BoardingOrder, 'id' | 'createdAt' | 'totalAmount'>
    );
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/orders/:id', (req: Request, res: Response) => {
  const order = storeApi.updateBoardingOrder(req.params.id, req.body);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  res.json(order);
});

router.post('/calculate-price', (req: Request, res: Response) => {
  const { checkIn, checkOut, roomType, petType, services } = req.body;
  const price = storeApi.calcBoardingPrice(
    checkIn,
    checkOut,
    roomType,
    petType,
    services || []
  );
  res.json({ price });
});

router.get('/pricing', (_req: Request, res: Response) => {
  res.json(storeApi.getPricingRules());
});

router.put('/pricing/:id', (req: Request, res: Response) => {
  const rule = storeApi.updatePricingRule(req.params.id, req.body as Partial<PricingRule>);
  if (!rule) return res.status(404).json({ error: '规则不存在' });
  res.json(rule);
});

router.get('/addons', (_req: Request, res: Response) => {
  res.json(storeApi.getAddonServices());
});

export default router;
