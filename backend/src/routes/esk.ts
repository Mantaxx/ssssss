import { Router } from 'express';
import { z } from 'zod';
import { UniversalParser } from '../services/esk-parsers/UniversalParser';

const router = Router();

const uploadSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['clock', 'basket']),
});

router.post('/parse', (req, res) => {
  const parse = uploadSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid request body', code: 'BAD_REQUEST' } });
  }

  const { content, type } = parse.data;

  try {
    let results;
    if (type === 'clock') {
      results = UniversalParser.parseClockList(content);
    } else {
      results = UniversalParser.parseBasketList(content);
    }

    return res.json({
      type,
      system: results[0]?.system || 'unknown',
      count: results.length,
      results,
    });
  } catch (error: any) {
    return res.status(400).json({ error: { message: error.message, code: 'PARSE_ERROR' } });
  }
});

router.post('/detect-system', (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: { message: 'content required', code: 'BAD_REQUEST' } });
  }

  try {
    const system = UniversalParser.detectSystem(content);
    return res.json({ system });
  } catch (error: any) {
    return res.status(400).json({ error: { message: error.message, code: 'DETECT_ERROR' } });
  }
});

export default router;
