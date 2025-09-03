import { z } from 'zod';

const TipesResultSchema = z.object({
  ringNumber: z.string(),
  arrivalTime: z.string(),
  position: z.number().optional(),
});

export interface TipesResult {
  ringNumber: string;
  arrivalTime: string;
  position?: number;
}

export class TipesParser {
  static parseClockList(content: string): TipesResult[] {
    const lines = content.split('\n').filter(line => line.trim());
    const results: TipesResult[] = [];

    for (const line of lines) {
      // Tipes format: "PL-1234-20-5678 14:25:30 1"
      const match = line.match(/^([A-Z]{2}-\d{4}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(\d+)?/);
      if (match) {
        const [, ringNumber, arrivalTime, position] = match;
        results.push({
          ringNumber,
          arrivalTime,
          position: position ? parseInt(position) : undefined,
        });
      }
    }

    return results;
  }

  static parseBasketList(content: string): { ringNumber: string; fancierName: string }[] {
    const lines = content.split('\n').filter(line => line.trim());
    const results: { ringNumber: string; fancierName: string }[] = [];

    for (const line of lines) {
      // Tipes basket format: "PL-1234-20-5678 Jan Kowalski"
      const match = line.match(/^([A-Z]{2}-\d{4}-\d{2}-\d{4})\s+(.+)$/);
      if (match) {
        const [, ringNumber, fancierName] = match;
        results.push({ ringNumber, fancierName });
      }
    }

    return results;
  }
}
