import { Router } from 'express';
import { z } from 'zod';
import { CompetitionListExporter } from '../services/export/CompetitionListExporter';
import { prisma } from '../db/prisma';

const router = Router();

const exportSchema = z.object({
  raceId: z.coerce.number().int().positive(),
  format: z.enum(['csv', 'pdf']),
});

router.get('/competition-list/:raceId', async (req, res) => {
  const parse = exportSchema.safeParse({
    raceId: req.params.raceId,
    format: req.query.format || 'csv',
  });

  if (!parse.success) {
    return res.status(400).json({ error: { message: 'invalid parameters', code: 'BAD_REQUEST' } });
  }

  const { raceId, format } = parse.data;

  try {
    const results = await prisma.result.findMany({
      where: { raceId },
      include: {
        race: true,
        pigeon: true,
        fancier: true,
      },
      orderBy: { position: 'asc' },
    });

    if (results.length === 0) {
      return res.status(404).json({ error: { message: 'No results found', code: 'NOT_FOUND' } });
    }

    const exportData = await CompetitionListExporter.exportFromResults(results as any);

    if (!exportData) {
      return res.status(404).json({ error: { message: 'Could not generate export data', code: 'NOT_FOUND' } });
    }

    if (format === 'csv') {
      const csvContent = CompetitionListExporter.generateCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="lista-konkursowa-${raceId}.csv"`);
      return res.send(csvContent);
    } else {
      const pdfBuffer = await CompetitionListExporter.generatePDF(exportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="lista-konkursowa-${raceId}.pdf"`);
      return res.send(pdfBuffer);
    }
  } catch (error: any) {
    return res.status(500).json({ error: { message: error.message, code: 'INTERNAL_ERROR' } });
  }
});

export default router;
