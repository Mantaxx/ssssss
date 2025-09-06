import { Router } from 'express';
import { z } from 'zod';
import { StandardCoeffStrategy, GMPPointsStrategy } from '../services/race-calculator/strategies';
import { prisma } from '../db/prisma';

const router = Router();

const querySchema = z.object({
  total: z.coerce.number().int().positive(),
  strategy: z.enum(['standard', 'gmp']).default('standard'),
});

router.get('/competition-list', (req, res) => {
  const parse = querySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid query', code: 'BAD_REQUEST' } });
  }
  const { total, strategy } = parse.data;
  const calcStrategy = strategy === 'gmp' ? GMPPointsStrategy() : StandardCoeffStrategy();
  const sample = Array.from({ length: Math.min(20, total) }, (_, i) => {
    const position = i + 1;
    return calcStrategy.calculate({ position, totalPigeonsBasketed: total });
  });
  return res.json({ items: sample, strategy, total });
});

router.get('/competition-list/:raceId', async (req, res) => {
  const { raceId } = req.params;
  const parse = querySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid query', code: 'BAD_REQUEST' } });
  }
  const { strategy } = parse.data;
  
  try {
    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: {
        results: {
          include: {
            pigeon: true,
            fancier: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!race) {
      return res.status(404).json({ error: { message: 'Race not found', code: 'NOT_FOUND' } });
    }

    const calcStrategy = strategy === 'gmp' ? GMPPointsStrategy() : StandardCoeffStrategy();
    const results = race.results.map((result) => {
      if (!result.position || !race.totalPigeonsBasketed) return result;
      const calculated = calcStrategy.calculate({
        position: result.position,
        totalPigeonsBasketed: race.totalPigeonsBasketed,
      });
      return { ...result, coefficient: calculated.coefficient };
    });

    return res.json({
      raceId: parseInt(raceId),
      strategy,
      race: {
        name: race.name,
        totalPigeonsBasketed: race.totalPigeonsBasketed,
        totalFanciers: race.totalFanciers,
      },
      results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

router.get('/:raceId/visualize', async (req, res) => {
  const { raceId } = req.params;

  try {
    const race = await prisma.race.findUnique({
      where: { id: parseInt(raceId) },
      include: { releasePoint: true },
    });

    if (!race) {
      return res.status(404).json({ error: { message: 'Race not found', code: 'NOT_FOUND' } });
    }

    const lofts = await prisma.loft.findMany({
      include: { fancier: { select: { name: true } } },
    });

    return res.json({ race, lofts });
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

export default router;
