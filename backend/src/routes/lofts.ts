import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

// GET /api/lofts - pobiera wszystkie gołębniki
router.get('/', async (_req: Request, res: Response) => {
  try {
    const lofts = await prisma.loft.findMany();
    res.json(lofts);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

export default router;