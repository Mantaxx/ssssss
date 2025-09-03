import React, { useEffect, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import type { Feature, LineString, Point } from 'geojson';

export interface RaceRouteLayerProps {
  map: mapboxgl.Map | null;
  // Unikalne ID dla trasy, aby uniknąć konfliktów przy wielu trasach
  routeId: string;
  // Współrzędne w formacie [długość, szerokość]
  startCoordinates: [number, number];
  endCoordinates: [number, number];
  color?: string;
  animationDuration?: number; // Czas trwania animacji w milisekundach
  markerImage?: string; // URL do obrazka znacznika
}

export const RaceRouteLayer: React.FC<RaceRouteLayerProps> = ({
  map,
  routeId,
  startCoordinates,
  endCoordinates,
  color = '#0ea5e9', // Domyślny niebieski kolor
  animationDuration = 2000, // Domyślny czas animacji: 2 sekundy
  markerImage = '/pigeon-marker.png', // Domyślna ścieżka do obrazka w folderze /public
}) => {
  const sourceId = `route-source-${routeId}`;
  const layerId = `route-layer-${routeId}`;
  const markerSourceId = `route-marker-source-${routeId}`;
  const markerLayerId = `route-marker-layer-${routeId}`;
  const markerImageId = 'pigeon-marker-icon'; // Unikalne ID dla obrazka w stylu mapy
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !startCoordinates || !endCoordinates) {
      return;
    }

    // Anuluj poprzednią animację, jeśli istnieje
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const setupAndAnimate = (isMarkerAvailable: boolean) => {
      const lineSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      const initialGeoJSON: Feature<LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [startCoordinates, startCoordinates], // Zacznij od linii o zerowej długości
        },
      };

      if (!lineSource) {
        // Jeśli nie, dodaj nowe źródło i warstwę
        map.addSource(sourceId, {
          type: 'geojson',
          data: initialGeoJSON,
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': 3,
            'line-opacity': 0.8,
          },
        });
      } else {
        lineSource.setData(initialGeoJSON);
      }

      // Konfiguracja znacznika
      if (isMarkerAvailable) {
        const markerSource = map.getSource(markerSourceId) as mapboxgl.GeoJSONSource;
        const initialMarkerGeoJSON: Feature<Point> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: startCoordinates,
          },
        };

        if (!markerSource) {
          map.addSource(markerSourceId, {
            type: 'geojson',
            data: initialMarkerGeoJSON,
          });
          map.addLayer({
            id: markerLayerId,
            source: markerSourceId,
            type: 'symbol',
            layout: {
              'icon-image': markerImageId,
              'icon-size': 0.07, // Dostosuj rozmiar w razie potrzeby
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-rotate': ['get', 'bearing'], // Dynamicznie obracaj ikonę
              'icon-rotation-alignment': 'map',
            },
          });
        } else {
          markerSource.setData(initialMarkerGeoJSON);
        }
      }

      const startTime = performance.now();
      let lastPoint = startCoordinates;

      const animateLine = (currentTime: number) => {
        const currentLineSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (!currentLineSource) return;

        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        // Aby linia była gładka na terenie 3D, musimy dodać punkty pośrednie.
        const totalSegments = 100; // Im więcej segmentów, tym gładsza linia.
        const currentSegments = Math.ceil(totalSegments * progress);

        const coordinates: [number, number][] = [];
        let bearing = 0;

        for (let i = 0; i <= currentSegments; i++) {
          const t = i / totalSegments;
          if (t > progress) break; // Nie rysuj dalej niż aktualny postęp
          const lng = startCoordinates[0] + (endCoordinates[0] - startCoordinates[0]) * t;
          const lat = startCoordinates[1] + (endCoordinates[1] - startCoordinates[1]) * t;
          const newPoint: [number, number] = [lng, lat];
          coordinates.push(newPoint);
          lastPoint = newPoint;
        }

        // Upewnij się, że ostatni punkt jest dokładnie na końcu, gdy animacja się zakończy
        if (progress === 1) {
          const lastPoint = coordinates[coordinates.length - 1];
          if (!lastPoint || lastPoint[0] !== endCoordinates[0] || lastPoint[1] !== endCoordinates[1]) {
            coordinates.push(endCoordinates);
          }
          lastPoint = endCoordinates;
        }

        const animatedGeoJSON: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            // GeoJSON LineString potrzebuje co najmniej 2 punktów
            coordinates: coordinates.length > 1 ? coordinates : [startCoordinates, startCoordinates],
          },
        };
        currentLineSource.setData(animatedGeoJSON);

        // Aktualizuj pozycję i obrót znacznika
        if (isMarkerAvailable) {
          const currentMarkerSource = map.getSource(markerSourceId) as mapboxgl.GeoJSONSource;
          if (currentMarkerSource) {
            // Oblicz kąt (bearing) do obrotu ikony
            if (coordinates.length > 1) {
              const p1 = map.project(coordinates[coordinates.length - 2]);
              const p2 = map.project(coordinates[coordinates.length - 1]);
              bearing = (Math.atan2(p2.x - p1.x, p1.y - p2.y) * 180) / Math.PI;
            }

            const markerGeoJSON: Feature<Point> = {
              type: 'Feature',
              properties: {
                bearing: bearing,
              },
              geometry: {
                type: 'Point',
                coordinates: lastPoint,
              },
            };
            currentMarkerSource.setData(markerGeoJSON);
          }
        }

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animateLine);
        }
      }

      animationFrameId.current = requestAnimationFrame(animateLine);
    };

    // Załaduj obrazek znacznika, a następnie rozpocznij animację
    map.loadImage(markerImage, (error, image) => {
      if (error) {
        console.error('Nie udało się załadować obrazka znacznika, kontynuacja bez znacznika.', error);
        setupAndAnimate(false);
        return;
      }
      if (image && !map.hasImage(markerImageId)) {
        map.addImage(markerImageId, image);
      }
      setupAndAnimate(true);
    });

    // Funkcja czyszcząca, która usuwa warstwę i źródło po odmontowaniu komponentu
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (!map.getStyle()) return; // Map already removed
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      if (map.getLayer(markerLayerId)) {
        map.removeLayer(markerLayerId);
      }
      if (map.getSource(markerSourceId)) {
        map.removeSource(markerSourceId);
      }
    };
  }, [map, routeId, startCoordinates, endCoordinates, color, animationDuration, markerImage]);

  // Komponent nie renderuje żadnego elementu DOM, jedynie manipuluje mapą
  return null;
};