import { useState, useEffect } from 'react';

interface WeatherData {
  lat: number;
  lon: number;
  altitude: string;
  time: string;
  data: any;
}

export function useWeather(lat: number, lon: number, altitude: string, time: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          hours: '72',
        });
        
        const response = await fetch(`/api/weather/forecast?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setWeatherData({
          lat,
          lon,
          altitude,
          time,
          data: data.data,
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon, altitude, time]);

  return { weatherData, loading, error };
}
