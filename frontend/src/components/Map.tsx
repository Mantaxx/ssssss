import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Pobranie tokena Mapbox ze zmiennych środowiskowych
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('Brak tokena Mapbox. Utwórz plik .env.local w katalogu frontend i dodaj VITE_MAPBOX_TOKEN=twoj_token');
}

const Map = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(19.0402); // Domyślna długość geograficzna (Polska)
  const [lat] = useState(50.2584); // Domyślna szerokość geograficzna (Polska)
  const [zoom] = useState(4);

  useEffect(() => {
    if (map.current || !mapContainer.current || !MAPBOX_TOKEN) return; // Inicjalizuj mapę tylko raz i tylko jeśli jest token

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' }, // Użycie projekcji "globe" zgodnie z wytycznymi
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      // Dodanie terenu 3D zgodnie z wytycznymi
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Dodanie mgły atmosferycznej dla lepszego efektu
      map.current.setFog({
        color: 'rgb(186, 210, 235)', // Dolna atmosfera
        'high-color': 'rgb(36, 92, 223)', // Górna atmosfera
        'horizon-blend': 0.02, // Grubość atmosfery
        'space-color': 'rgb(11, 11, 25)', // Kolor tła kosmosu
        'star-intensity': 0.6, // Intensywność gwiazd
      });
    });

    // Sprzątanie przy odmontowaniu komponentu
    return () => map.current?.remove();
  }, [lng, lat, zoom]);

  return (
    <div ref={mapContainer} className="absolute top-0 bottom-0 w-full h-full" />
  );
};

export default Map;