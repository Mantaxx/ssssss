import { StandardCoeffStrategy, GMPPointsStrategy } from '../services/race-calculator/strategies';

describe('Calculation Strategies', () => {
  describe('StandardCoeffStrategy', () => {
    const strategy = StandardCoeffStrategy();

    it('should calculate coefficient for 1:5 ratio with 5000 limit', () => {
      const result = strategy.calculate({
        position: 1,
        totalPigeonsBasketed: 1000,
      });
      
      expect(result.coefficient).toBe(200000); // ( (1000 * 0.2) / 1) * 1000 = 200000
    });

    it('should apply 5000 limit for large competitions', () => {
      const result = strategy.calculate({
        position: 1,
        totalPigeonsBasketed: 50000,
      });
      
      expect(result.coefficient).toBe(5000000); // ( min(50000 * 0.2, 5000) / 1) * 1000 = 5000000
    });

    it('should handle minimum competition count', () => {
      const result = strategy.calculate({
        position: 1,
        totalPigeonsBasketed: 1,
      });
      
      expect(result.coefficient).toBe(1000); // ( max(1, floor(1 * 0.2)) / 1) * 1000 = 1000
    });
  });

  describe('GMPPointsStrategy', () => {
    const strategy = GMPPointsStrategy();

    it('should give 40 points for first place', () => {
      const result = strategy.calculate({
        position: 1,
        totalPigeonsBasketed: 1000,
      });
      
      expect(result.coefficient).toBe(40);
    });

    it('should apply 20% decline for subsequent places', () => {
      const result1 = strategy.calculate({
        position: 1,
        totalPigeonsBasketed: 1000,
      });
      
      const result2 = strategy.calculate({
        position: 2,
        totalPigeonsBasketed: 1000,
      });
      
      expect(result2.coefficient).toBe(32); // 40 * 0.8
    });

    it('should handle higher positions correctly', () => {
      const result = strategy.calculate({
        position: 5,
        totalPigeonsBasketed: 1000,
      });
      
      expect(result.coefficient).toBeCloseTo(16.38, 2); // 40 * 0.8^4
    });
  });
});
