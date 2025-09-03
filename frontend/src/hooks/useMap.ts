import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export function useMap(container: HTMLDivElement | null) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container || mapRef.current) return;
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (!token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [19.1451, 51.9194],
      zoom: 5,
      projection: 'globe',
    });
    map.on('style.load', () => {
      map.setFog({});
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [container]);

  return mapRef;
}

