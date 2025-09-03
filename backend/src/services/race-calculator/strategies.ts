export interface ResultInput {
  position: number;
  totalPigeonsBasketed: number;
}

export interface ResultOutput extends ResultInput {
  coefficient: number;
}

export interface CalculationStrategy {
  calculate(result: ResultInput): ResultOutput;
}

export const StandardCoeffStrategy = (): CalculationStrategy => ({
  calculate: (result: ResultInput): ResultOutput => {
    const competitionCount = Math.max(1, Math.floor(result.totalPigeonsBasketed * 0.2));
    const denom = Math.min(competitionCount, 5000);
    const coeff = (denom / result.position) * 1000;
    return { ...result, coefficient: Number(coeff.toFixed(4)) };
  },
});

export const GMPPointsStrategy = (): CalculationStrategy => ({
  calculate: (result: ResultInput): ResultOutput => {
    // GMP points with 20% decline, first place gets 40 points
    const basePoints = 40;
    const declineRate = 0.2;
    const points = basePoints * Math.pow(1 - declineRate, result.position - 1);
    return { ...result, coefficient: Number(points.toFixed(2)) };
  },
});

