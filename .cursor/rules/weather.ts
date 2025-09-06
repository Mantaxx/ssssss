import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Prosta pamięć podręczna w pamięci, aby unikać zbyt częstego odpytywania API podczas developmentu
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minut

interface OpenMeteoHourlyData {
  time: string[];
  windspeed_10m: number[];
  winddirection_10m: number[];
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: OpenMeteoHourlyData;
}

// W przyszłości funkcja ta będzie przyjmować granice mapy jako argumenty.
// Na razie pobiera predefiniowaną siatkę danych dla Europy.
async function getWindData() {
  const cacheKey = 'wind-data-europe-grid';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Definicja siatki (np. 25x25 dla Europy dla lepszej gęstości)
  const gridWidth = 25;
  const gridHeight = 25;
  const latMin = 35, latMax = 70, lonMin = -15, lonMax = 45;

  const lats: number[] = Array.from({ length: gridHeight }, (_, i) => latMin + i * (latMax - latMin) / (gridHeight - 1));
  const lons: number[] = Array.from({ length: gridWidth }, (_, i) => lonMin + i * (lonMax - lonMin) / (gridWidth - 1));

  const params = {
    latitude: lats.join(','),
    longitude: lons.join(','),
    hourly: 'windspeed_10m,winddirection_10m',
    forecast_days: 1,
  };

  try {
    const response = await axios.get<OpenMeteoResponse[]>('https://api.open-meteo.com/v1/forecast', { params });
    
    // API zwraca tablicę odpowiedzi, po jednej dla każdej szerokości geograficznej.
    // Musimy spłaszczyć te dane do jednej siatki dla pierwszej godziny prognozy.
    const windSpeeds = response.data.flatMap(res => res.hourly.windspeed_10m[0]);
    const windDirections = response.data.flatMap(res => res.hourly.winddirection_10m[0]);

    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
    const uComponents: number[] = [];
    const vComponents: number[] = [];

    for (let i = 0; i < windSpeeds.length; i++) {
      const speed = windSpeeds[i];
      const direction = windDirections[i]; // stopnie, kierunek Z którego wieje wiatr

      // Konwersja na składowe U i V
      const directionRad = direction * (Math.PI / 180);
      const u = -speed * Math.sin(directionRad); // składowa zachód-wschód
      const v = -speed * Math.cos(directionRad); // składowa południe-północ

      uComponents.push(u);
      vComponents.push(v);

      if (u < uMin) uMin = u;
      if (u > uMax) uMax = u;
      if (v < vMin) vMin = v;
      if (v > vMax) vMax = v;
    }

    const processedData = {
      source: 'Open-Meteo',
      width: gridWidth, height: gridHeight,
      uMin, uMax, vMin, vMax,
      lonMin, lonMax, latMin, latMax,
      data: { u: uComponents, v: vComponents },
    };
    
    cache.set(cacheKey, { data: processedData, timestamp: Date.now() });
    return processedData;
  } catch (error) {
    console.error("Błąd podczas pobierania danych z Open-Meteo:", error);
    throw new Error("Nie udało się pobrać danych pogodowych.");
  }
}

router.get('/wind', async (_req, res) => {
  try {
    const data = await getWindData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message, code: 'WEATHER_FETCH_FAILED' } });
  }
});

export default router;