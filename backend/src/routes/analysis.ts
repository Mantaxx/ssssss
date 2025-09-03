import { Router } from 'express';
import { z } from 'zod';
import { WeatherAnalysis } from '../services/historical-analysis/WeatherAnalysis';

const router = Router();

const pigeonIdSchema = z.object({
  pigeonId: z.coerce.number().int().positive(),
});

router.get('/pigeon/:pigeonId/history', async (req, res) => {
  const parse = pigeonIdSchema.safeParse(req.params);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid pigeon ID', code: 'BAD_REQUEST' } });
  }

  const { pigeonId } = parse.data;

  try {
    const historicalData = await WeatherAnalysis.getHistoricalData(pigeonId);
    return res.json({ pigeonId, historicalData });
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

router.get('/pigeon/:pigeonId/profile', async (req, res) => {
  const parse = pigeonIdSchema.safeParse(req.params);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid pigeon ID', code: 'BAD_REQUEST' } });
  }

  const { pigeonId } = parse.data;

  try {
    const profile = await WeatherAnalysis.analyzePigeonProfile(pigeonId);
    return res.json({ pigeonId, profile });
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

export default router;
