import { z } from 'zod';

export const forecastSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  altitudes: z.array(z.union([z.literal('10m'), z.literal('100m'), z.literal('250m'), z.literal('500m'), z.literal('850hPa'), z.literal('700hPa')])).default(['10m']),
  hours: z.number().int().min(1).max(336).default(72),
});

type ForecastInput = z.infer<typeof forecastSchema>;

export async function fetchForecast(input: ForecastInput) {
  const { lat, lon, hours } = input;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('hourly', [
    'wind_speed_10m',
    'wind_direction_10m',
    'temperature_2m',
    'relative_humidity_2m',
    'visibility',
    'cloud_cover',
    'precipitation',
  ].join(','));
  url.searchParams.set('forecast_days', String(Math.ceil(hours / 24)));
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`open-meteo error ${res.status}`);
  return res.json();
}

