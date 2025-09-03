import { z } from 'zod';

export interface BenzingResult {
  ringNumber: string;
  arrivalTime: string;
  position?: number;
  speed?: number;
}

export class BenzingParser {
  static parseClockList(content: string): BenzingResult[] {
    const lines = content.split('\n').filter(line => line.trim());
    const results: BenzingResult[] = [];

    for (const line of lines) {
      // Benzing format: "PL-1234-20-5678 14:25:30 1 1250.5"
      const match = line.match(/^([A-Z]{2}-\d{4}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+(\d+)\s+(\d+\.?\d*)?/);
      if (match) {
        const [, ringNumber, arrivalTime, position, speed] = match;
        results.push({
          ringNumber,
          arrivalTime,
          position: parseInt(position),
          speed: speed ? parseFloat(speed) : undefined,
        });
      }
    }

    return results;
  }

  static parseBasketList(content: string): { ringNumber: string; fancierName: string; club: string }[] {
    const lines = content.split('\n').filter(line => line.trim());
    const results: { ringNumber: string; fancierName: string; club: string }[] = [];

    for (const line of lines) {
      // Benzing basket format: "PL-1234-20-5678 Jan Kowalski Warszawa"
      const match = line.match(/^([A-Z]{2}-\d{4}-\d{2}-\d{4})\s+(.+?)\s+([A-Za-z\s]+)$/);
      if (match) {
        const [, ringNumber, fancierName, club] = match;
        results.push({ ringNumber, fancierName, club });
      }
    }

    return results;
  }
}
