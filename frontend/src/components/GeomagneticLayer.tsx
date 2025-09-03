import React, { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';

interface GeomagneticLayerProps {
  map: mapboxgl.Map | null;
  enabled: boolean;
}

// Stub for geomagnetic anomalies visualization
export const GeomagneticLayer: React.FC<GeomagneticLayerProps> = ({ map, enabled }) => {
  useEffect(() => {
    if (!map || !enabled) return;

    const layerId = 'geomagnetic-anomalies';
    
    // Add mock geomagnetic data source
    if (!map.getSource('geomagnetic-data')) {
      map.addSource('geomagnetic-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [19.1451, 51.9194], // Poland center
              },
              properties: {
                intensity: 0.3,
                type: 'anomaly',
              },
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [21.0122, 52.2297], // Warsaw
              },
              properties: {
                intensity: 0.1,
                type: 'normal',
              },
            },
          ],
        },
      });
    }

    // Add heatmap layer for geomagnetic intensity
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'heatmap',
        source: 'geomagnetic-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 0,
            1, 1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.1, 'rgba(0, 0, 255, 0.1)',
            0.3, 'rgba(0, 255, 0, 0.2)',
            0.5, 'rgba(255, 255, 0, 0.3)',
            0.7, 'rgba(255, 165, 0, 0.4)',
            1, 'rgba(255, 0, 0, 0.5)',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20,
          ],
          'heatmap-opacity': 0.6,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource('geomagnetic-data')) {
        map.removeSource('geomagnetic-data');
      }
    };
  }, [map, enabled]);

  return null;
};
