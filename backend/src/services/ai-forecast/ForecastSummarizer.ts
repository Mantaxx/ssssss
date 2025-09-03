interface WeatherConditions {
  windSpeed: number;
  windDirection: number;
  temperature: number;
  humidity: number;
  visibility: number;
  precipitation: number;
}

interface ForecastSummary {
  overallAssessment: string;
  safetyRating: number; // 1-10
  performanceFactors: {
    wind: string;
    temperature: string;
    visibility: string;
    precipitation: string;
  };
  recommendations: string[];
  timeWindows: {
    best: string;
    avoid: string;
  };
}

export class ForecastSummarizer {
  static generateSummary(conditions: WeatherConditions): ForecastSummary {
    const windAssessment = this.assessWind(conditions.windSpeed, conditions.windDirection);
    const tempAssessment = this.assessTemperature(conditions.temperature);
    const visibilityAssessment = this.assessVisibility(conditions.visibility);
    const precipitationAssessment = this.assessPrecipitation(conditions.precipitation);

    const safetyRating = this.calculateSafetyRating(conditions);
    const overallAssessment = this.generateOverallAssessment(conditions, safetyRating);
    const recommendations = this.generateRecommendations(conditions);
    const timeWindows = this.suggestTimeWindows(conditions);

    return {
      overallAssessment,
      safetyRating,
      performanceFactors: {
        wind: windAssessment,
        temperature: tempAssessment,
        visibility: visibilityAssessment,
        precipitation: precipitationAssessment,
      },
      recommendations,
      timeWindows,
    };
  }

  private static assessWind(speed: number, direction: number): string {
    if (speed < 5) return 'Słaby wiatr - dobre warunki lotu';
    if (speed < 15) return 'Umiarkowany wiatr - normalne warunki';
    if (speed < 25) return 'Silny wiatr - wymagająca nawigacja';
    return 'Bardzo silny wiatr - niebezpieczne warunki';
  }

  private static assessTemperature(temp: number): string {
    if (temp < 5) return 'Niska temperatura - możliwe problemy z nawigacją';
    if (temp < 15) return 'Chłodna temperatura - dobre warunki';
    if (temp < 25) return 'Optymalna temperatura';
    if (temp < 35) return 'Wysoka temperatura - zwiększone obciążenie';
    return 'Bardzo wysoka temperatura - niebezpieczne warunki';
  }

  private static assessVisibility(visibility: number): string {
    if (visibility > 15) return 'Doskonała widoczność';
    if (visibility > 10) return 'Dobra widoczność';
    if (visibility > 5) return 'Ograniczona widoczność';
    if (visibility > 2) return 'Słaba widoczność - problemy z nawigacją';
    return 'Bardzo słaba widoczność - niebezpieczne warunki';
  }

  private static assessPrecipitation(precipitation: number): string {
    if (precipitation === 0) return 'Brak opadów';
    if (precipitation < 2) return 'Lekkie opady';
    if (precipitation < 10) return 'Umiarkowane opady';
    return 'Silne opady - niebezpieczne warunki';
  }

  private static calculateSafetyRating(conditions: WeatherConditions): number {
    let rating = 10;

    // Wind penalty
    if (conditions.windSpeed > 20) rating -= 3;
    else if (conditions.windSpeed > 15) rating -= 2;
    else if (conditions.windSpeed > 10) rating -= 1;

    // Temperature penalty
    if (conditions.temperature > 30 || conditions.temperature < 0) rating -= 2;
    else if (conditions.temperature > 25 || conditions.temperature < 5) rating -= 1;

    // Visibility penalty
    if (conditions.visibility < 5) rating -= 2;
    else if (conditions.visibility < 10) rating -= 1;

    // Precipitation penalty
    if (conditions.precipitation > 5) rating -= 2;
    else if (conditions.precipitation > 1) rating -= 1;

    return Math.max(1, rating);
  }

  private static generateOverallAssessment(conditions: WeatherConditions, rating: number): string {
    if (rating >= 8) {
      return 'Doskonałe warunki do lotu. Gołębie powinny osiągnąć wysokie prędkości i dobre wyniki.';
    } else if (rating >= 6) {
      return 'Dobre warunki do lotu z niewielkimi wyzwaniami. Oczekiwane normalne wyniki.';
    } else if (rating >= 4) {
      return 'Trudne warunki lotu. Gołębie mogą mieć problemy z nawigacją i osiągnąć niższe prędkości.';
    } else {
      return 'Bardzo trudne lub niebezpieczne warunki. Zalecane odłożenie lotu.';
    }
  }

  private static generateRecommendations(conditions: WeatherConditions): string[] {
    const recommendations: string[] = [];

    if (conditions.windSpeed > 15) {
      recommendations.push('Sprawdź orientację gołębi przed wypuszczeniem');
    }

    if (conditions.temperature > 25) {
      recommendations.push('Zapewnij odpowiednie nawodnienie gołębi');
    }

    if (conditions.visibility < 10) {
      recommendations.push('Rozważ odłożenie lotu do poprawy widoczności');
    }

    if (conditions.precipitation > 2) {
      recommendations.push('Unikaj lotów w deszczu - wysokie ryzyko strat');
    }

    if (recommendations.length === 0) {
      recommendations.push('Warunki są optymalne - można bezpiecznie przeprowadzić lot');
    }

    return recommendations;
  }

  private static suggestTimeWindows(conditions: WeatherConditions): { best: string; avoid: string } {
    if (conditions.temperature > 25) {
      return {
        best: 'Wczesne godziny poranne (6:00-10:00)',
        avoid: 'Południe i popołudnie (12:00-16:00)',
      };
    }

    if (conditions.windSpeed > 15) {
      return {
        best: 'Godziny z mniejszym wiatrem',
        avoid: 'Szczyty wietrzności',
      };
    }

    return {
      best: 'Cały dzień',
      avoid: 'Brak ograniczeń',
    };
  }
}
