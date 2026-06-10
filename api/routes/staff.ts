import { Router, Request, Response } from 'express';
import { storeApi } from '../data/store';
import type { Staff, SalaryRecord, PerformanceAdjustment } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(storeApi.getStaff());
});

router.get('/:id', (req: Request, res: Response) => {
  const s = storeApi.getStaffMember(req.params.id);
  if (!s) return res.status(404).json({ error: '员工不存在' });
  res.json(s);
});

router.post('/', (req: Request, res: Response) => {
  const s = storeApi.createStaff(req.body as Omit<Staff, 'id'>);
  res.status(201).json(s);
});

router.put('/:id', (req: Request, res: Response) => {
  const s = storeApi.updateStaff(req.params.id, req.body);
  if (!s) return res.status(404).json({ error: '员工不存在' });
  res.json(s);
});

router.delete('/:id', (req: Request, res: Response) => {
  storeApi.deleteStaff(req.params.id);
  res.json({ success: true });
});

router.get('/salary/records', (req: Request, res: Response) => {
  const { month } = req.query;
  res.json(storeApi.getSalaryRecords(month as string));
});

router.post('/salary/calculate', (req: Request, res: Response) => {
  try {
    const { staffId, month } = req.body;
    const record = storeApi.calculateSalary(staffId, month);
    res.json(record);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.post('/salary/records', (req: Request, res: Response) => {
  const record = storeApi.createSalaryRecord(
    req.body as Omit<SalaryRecord, 'id' | 'createdAt'>
  );
  res.status(201).json(record);
});

router.put('/salary/records/:id', (req: Request, res: Response) => {
  const record = storeApi.updateSalaryRecord(req.params.id, req.body);
  if (!record) return res.status(404).json({ error: '记录不存在' });
  res.json(record);
});

router.get('/performance/five-star-stats', (req: Request, res: Response) => {
  const { month, staffId } = req.query;
  if (!month) return res.status(400).json({ error: 'month参数必填' });
  res.json(storeApi.getFiveStarStats(month as string, staffId as string));
});

router.get('/performance/adjustments', (req: Request, res: Response) => {
  const { staffId, month } = req.query;
  res.json(
    storeApi.getPerformanceAdjustments({
      staffId: staffId as string,
      month: month as string,
    })
  );
});

router.post('/performance/adjustments', (req: Request, res: Response) => {
  try {
    const adj = storeApi.createPerformanceAdjustment(
      req.body as Omit<PerformanceAdjustment, 'id' | 'createdAt'>
    );
    res.status(201).json(adj);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.delete('/performance/adjustments/:id', (req: Request, res: Response) => {
  const success = storeApi.deletePerformanceAdjustment(req.params.id);
  if (!success) return res.status(404).json({ error: '调整记录不存在' });
  res.json({ success: true });
});

export default router;
