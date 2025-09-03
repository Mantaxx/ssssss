import React, { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';

export interface WindLayerProps {
  map: mapboxgl.Map | null;
}

// Stub custom layer per Mapbox rule; particle animation to be implemented.
export const WindLayer: React.FC<WindLayerProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;
    const id = 'wind-layer-stub';
    if (map.getLayer(id)) return;
    map.addSource('wind-grid', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id,
      type: 'circle',
      source: 'wind-grid',
      paint: { 'circle-radius': 1.5, 'circle-color': '#0ea5e9' },
    });
    return () => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource('wind-grid')) map.removeSource('wind-grid');
    };
  }, [map]);
  return null;
};

