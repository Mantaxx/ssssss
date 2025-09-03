import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const predictionSchema = z.object({
  distance_km: z.number().positive(),
  wind_tail_component: z.number().optional(),
  visibility_km: z.number().positive().optional(),
});

router.post('/predict', async (req, res) => {
  const parse = predictionSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid request body', code: 'BAD_REQUEST' } });
  }

  const { distance_km, wind_tail_component, visibility_km } = parse.data;

  try {
    // Call AI microservice
    const aiResponse = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance_km,
        wind_tail_component,
        visibility_km,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    return res.json(aiData);
  } catch (error: any) {
    return res.status(502).json({ error: { message: error.message, code: 'AI_SERVICE_ERROR' } });
  }
});

export default router;
