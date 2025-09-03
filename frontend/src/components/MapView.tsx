import React, { useRef, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMap } from '../hooks/useMap';
import { WindParticlesLayer } from './Map/layers/WindParticlesLayer';
import { useWeather } from '../hooks/useWeather';

interface MapViewProps {
  altitude: string;
  time: string;
}

export const MapView: React.FC<MapViewProps> = ({ altitude, time }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const map = useMap(containerRef.current);
  const [center, setCenter] = useState<[number, number]>([19.1451, 51.9194]);
  
  const { weatherData, loading, error } = useWeather(center[1], center[0], altitude, time);

  useEffect(() => {
    if (!map?.current) return;
    
    map.current.on('moveend', () => {
      const center = map.current?.getCenter();
      if (center) {
        setCenter([center.lng, center.lat]);
      }
    });
  }, [map]);

  return (
    <div className="mt-6 h-96 w-full rounded-lg border border-gray-200 bg-white relative">
      <div ref={containerRef} className="h-full w-full" />
      <WindParticlesLayer 
        map={map?.current || null} 
        weatherData={weatherData}
        loading={loading}
      />
      {error && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
          Błąd pogody: {error}
        </div>
      )}
      {loading && (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Ładowanie danych pogodowych...
        </div>
      )}
    </div>
  );
};

