import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMap } from './MapContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error(
    'Brak tokena Mapbox. Utwórz plik .env w katalogu frontend i dodaj VITE_MAPBOX_TOKEN=twoj_token',
  );
}

export const MapCanvas = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const { setMap } = useMap();
  const [lng] = useState(19.0402);
  const [lat] = useState(50.2584);
  const [zoom] = useState(4);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' },
      center: [lng, lat],
      zoom: zoom,
    });

    mapInstance.on('load', () => {
      mapInstance.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      mapInstance.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });
      setMap(mapInstance);
    });

    return () => {
      setMap(null);
      mapInstance.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapContainer} className="absolute top-0 bottom-0 w-full" />;
};