import { Router } from 'express';
import { z } from 'zod';
import { fetchForecast, forecastSchema } from '../services/openMeteo';

const router = Router();

const querySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  hours: z.coerce.number().optional(),
});

router.get('/forecast', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: 'invalid query', code: 'BAD_REQUEST' } });
  }
  const input = forecastSchema.parse({ ...parsed.data });
  try {
    const data = await fetchForecast(input);
    return res.json({ input, data });
  } catch (e: any) {
    return res.status(502).json({ error: { message: e.message, code: 'UPSTREAM_ERROR' } });
  }
});

export default router;

