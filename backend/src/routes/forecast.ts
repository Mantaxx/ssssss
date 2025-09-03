import { Router } from 'express';
import { z } from 'zod';
import { ForecastSummarizer } from '../services/ai-forecast/ForecastSummarizer';

const router = Router();

const forecastSchema = z.object({
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  visibility: z.number().min(0),
  precipitation: z.number().min(0),
});

router.post('/summary', (req, res) => {
  const parse = forecastSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid forecast data', code: 'BAD_REQUEST' } });
  }

  try {
    const summary = ForecastSummarizer.generateSummary(parse.data);
    return res.json(summary);
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

export default router;
