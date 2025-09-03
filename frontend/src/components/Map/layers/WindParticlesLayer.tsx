import React, { useEffect, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';

interface WeatherData {
  lat: number;
  lon: number;
  altitude: string;
  time: string;
  data: any;
}

interface Props {
  map: mapboxgl.Map | null;
  weatherData?: WeatherData | null;
  loading?: boolean;
}

// Canvas-based custom layer stub for particle animation
export const WindParticlesLayer: React.FC<Props> = ({ map, weatherData, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!map) return;
    const id = 'wind-particles-custom';
    if (map.getLayer(id)) return;
    const customLayer = {
      id,
      type: 'custom' as const,
      renderingMode: '2d' as const,
      onAdd: (mbMap: mapboxgl.Map, gl: WebGLRenderingContext) => {
        const canvas = document.createElement('canvas');
        canvas.width = mbMap.getCanvas().width;
        canvas.height = mbMap.getCanvas().height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvasRef.current = canvas;
        mbMap.getCanvasContainer().appendChild(canvas);
      },
      render: () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (loading) {
          ctx.fillStyle = 'rgba(59,130,246,0.3)';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          return;
        }
        
        if (weatherData?.data?.hourly) {
          const windSpeed = weatherData.data.hourly.wind_speed_10m?.[0] || 0;
          const windDirection = weatherData.data.hourly.wind_direction_10m?.[0] || 0;
          const particleCount = Math.min(500, Math.max(50, windSpeed * 10));
          
          ctx.fillStyle = `rgba(14,165,233,${Math.min(0.8, windSpeed / 20)})`;
          for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * canvasRef.current.width;
            const y = Math.random() * canvasRef.current.height;
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        } else {
          // Fallback static particles
          ctx.fillStyle = 'rgba(14,165,233,0.6)';
          for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvasRef.current.width;
            const y = Math.random() * canvasRef.current.height;
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      },
      onRemove: (mbMap: mapboxgl.Map) => {
        if (canvasRef.current) {
          canvasRef.current.remove();
          canvasRef.current = null;
        }
      },
    };
    map.addLayer(customLayer);
    return () => {
      if (map.getLayer(id)) map.removeLayer(id);
    };
  }, [map]);
  return null;
};

