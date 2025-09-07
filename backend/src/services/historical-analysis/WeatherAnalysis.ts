import { prisma } from '../../db/prisma';

export interface HistoricalWeatherData {
  raceId: number;
  raceName: string;
  releaseDate: Date;
  weatherConditions: {
    windSpeed: number;
    windDirection: number;
    temperature: number;
    humidity: number;
    visibility: number;
  };
  pigeonPerformance: {
    ringNumber: string;
    speed: number;
    position: number;
    coefficient: number;
  }[];
}

export class WeatherAnalysis {
  static async getHistoricalData(pigeonId: number): Promise<HistoricalWeatherData[]> {
    const results = await prisma.result.findMany({
      where: { pigeonId },
      include: {
        race: {
          include: {
            releasePoint: true,
          },
        },
        pigeon: true,
      },
      orderBy: { race: { releaseDatetimeUtc: 'desc' } },
    });

    const historicalData: HistoricalWeatherData[] = [];

    for (const result of results) {
      if (!result.race?.releaseDatetimeUtc) continue;

      // TODO: Fetch historical weather data from Open-Meteo History API
      // For now, return mock data
      const weatherConditions = {
        windSpeed: Math.random() * 20,
        windDirection: Math.random() * 360,
        temperature: 15 + Math.random() * 15,
        humidity: 40 + Math.random() * 40,
        visibility: 5 + Math.random() * 15,
      };

      historicalData.push({
        raceId: result.raceId!,
        raceName: result.race.name ?? 'Unknown Race',
        releaseDate: result.race.releaseDatetimeUtc,
        weatherConditions,
        pigeonPerformance: [{
          ringNumber: result.pigeon?.ringNumber ?? 'Unknown',
          speed: Number(result.speedMPerMin) || 0,
          position: result.position ?? 0,
          coefficient: Number(result.coefficient) || 0,
        }],
      });
    }

    return historicalData;
  }

  static async analyzePigeonProfile(pigeonId: number): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const historicalData = await this.getHistoricalData(pigeonId);
    
    if (historicalData.length === 0) {
      return {
        strengths: [],
        weaknesses: [],
        recommendations: ['Brak danych historycznych'],
      };
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze wind conditions
    const windPerformances = historicalData.filter(d => d.weatherConditions.windSpeed > 10);
    if (windPerformances.length > 0) {
      const avgWindPerformance = windPerformances.reduce((sum, d) => 
        sum + d.pigeonPerformance[0].coefficient, 0) / windPerformances.length;
      
      if (avgWindPerformance > 1000) {
        strengths.push('Dobra wydajność przy silnym wietrze');
      } else {
        weaknesses.push('Słaba wydajność przy silnym wietrze');
      }
    }

    // Analyze temperature conditions
    const hotWeatherPerformances = historicalData.filter(d => d.weatherConditions.temperature > 25);
    if (hotWeatherPerformances.length > 0) {
      const avgHotPerformance = hotWeatherPerformances.reduce((sum, d) => 
        sum + d.pigeonPerformance[0].coefficient, 0) / hotWeatherPerformances.length;
      
      if (avgHotPerformance < 800) {
        weaknesses.push('Problemy w gorącą pogodę');
        recommendations.push('Unikaj lotów w upalne dni');
      }
    }

    // Analyze visibility conditions
    const lowVisibilityPerformances = historicalData.filter(d => d.weatherConditions.visibility < 10);
    if (lowVisibilityPerformances.length > 0) {
      const avgLowVisPerformance = lowVisibilityPerformances.reduce((sum, d) => 
        sum + d.pigeonPerformance[0].coefficient, 0) / lowVisibilityPerformances.length;
      
      if (avgLowVisPerformance < 600) {
        weaknesses.push('Słaba nawigacja przy ograniczonej widoczności');
        recommendations.push('Sprawdź orientację gołębia');
      }
    }

    if (strengths.length === 0) {
      strengths.push('Stabilna wydajność w różnych warunkach');
    }

    return { strengths, weaknesses, recommendations };
  }
}
