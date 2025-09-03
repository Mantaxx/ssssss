import { TipesParser, TipesResult } from './TipesParser';
import { BenzingParser, BenzingResult } from './BenzingParser';

export interface ParsedResult {
  ringNumber: string;
  arrivalTime: string;
  position?: number;
  speed?: number;
  fancierName?: string;
  club?: string;
  system: 'tipes' | 'benzing' | 'unknown';
}

export class UniversalParser {
  static detectSystem(content: string): 'tipes' | 'benzing' | 'unknown' {
    const lines = content.split('\n').slice(0, 5); // Check first 5 lines
    
    for (const line of lines) {
      // Tipes signature: "PL-1234-20-5678 14:25:30 1"
      if (/^[A-Z]{2}-\d{4}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}\s+\d+$/.test(line.trim())) {
        return 'tipes';
      }
      
      // Benzing signature: "PL-1234-20-5678 14:25:30 1 1250.5"
      if (/^[A-Z]{2}-\d{4}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}\s+\d+\s+\d+\.?\d*$/.test(line.trim())) {
        return 'benzing';
      }
    }
    
    return 'unknown';
  }

  static parseClockList(content: string): ParsedResult[] {
    const system = this.detectSystem(content);
    
    switch (system) {
      case 'tipes': {
        const results = TipesParser.parseClockList(content);
        return results.map(r => ({
          ...r,
          system: 'tipes' as const,
        }));
      }
      
      case 'benzing': {
        const results = BenzingParser.parseClockList(content);
        return results.map(r => ({
          ...r,
          system: 'benzing' as const,
        }));
      }
      
      default:
        throw new Error('Unknown ESK system format');
    }
  }

  static parseBasketList(content: string): ParsedResult[] {
    const system = this.detectSystem(content);
    
    switch (system) {
      case 'tipes': {
        const results = TipesParser.parseBasketList(content);
        return results.map(r => ({
          ringNumber: r.ringNumber,
          arrivalTime: '',
          fancierName: r.fancierName,
          system: 'tipes' as const,
        }));
      }
      
      case 'benzing': {
        const results = BenzingParser.parseBasketList(content);
        return results.map(r => ({
          ringNumber: r.ringNumber,
          arrivalTime: '',
          fancierName: r.fancierName,
          club: r.club,
          system: 'benzing' as const,
        }));
      }
      
      default:
        throw new Error('Unknown ESK system format');
    }
  }
}
