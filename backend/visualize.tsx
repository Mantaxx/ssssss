import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import type { Race, ReleasePoint, Loft, Fancier } from '@prisma/client';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RaceRouteLayer } from '../../../components/Map/layers/RaceRouteLayer';
import { WindLayer } from '../../../components/Map/layers/WindLayer';
import { TemperatureLayer } from '../../../components/Map/layers/TemperatureLayer';
import { CloudLayer } from '../../../components/Map/layers/CloudLayer';
import { calculateDistance } from '../../../utils/distance';

// Definiujemy typy danych, których oczekujemy z API
type LoftWithFancier = Loft & { fancier: { name: string | null } };
type RaceWithReleasePoint = Race & { releasePoint: ReleasePoint | null };

interface RaceVisualizationData {
  race: RaceWithReleasePoint;
  lofts: LoftWithFancier[];
}

const RaceVisualizePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [data, setData] = useState<RaceVisualizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoft, setSelectedLoft] = useState<LoftWithFancier | null>(null);
  const [showWindLayer, setShowWindLayer] = useState(false);
  const [showTempLayer, setShowTempLayer] = useState(false);
  const [showCloudLayer, setShowCloudLayer] = useState(false);

  const distance = useMemo(() => {
    if (
      !selectedLoft ||
      !data?.race.releasePoint ||
      !selectedLoft.latitude ||
      !selectedLoft.longitude ||
      !data.race.releasePoint.latitude ||
      !data.race.releasePoint.longitude
    ) {
      return null;
    }
    return calculateDistance(
      data.race.releasePoint.latitude, data.race.releasePoint.longitude,
      selectedLoft.latitude, selectedLoft.longitude
    );
  }, [selectedLoft, data?.race.releasePoint]);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get<RaceVisualizationData>(`/api/races/${id}/visualize`);
          setData(response.data);
          setError(null);
        } catch (err: any) {
          const errorMessage = err.response?.data?.error?.message || 'Wystąpił błąd podczas pobierania danych.';
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (map.current || !mapContainer.current || !data) return;

    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setError("Klucz dostępowy Mapbox nie jest ustawiony.");
      return;
    }
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [19.945, 50.064],
      zoom: 5,
    });

    const currentMap = map.current;

    currentMap.on('load', () => {
      currentMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      const { race, lofts } = data;
      if (!race.releasePoint?.longitude || !race.releasePoint?.latitude) {
        setError("Brak współrzędnych dla miejsca wypuszczenia.");
        return;
      }

      const releasePointCoords: [number, number] = [race.releasePoint.longitude, race.releasePoint.latitude];
      
      new mapboxgl.Marker({ color: '#d32f2f' })
        .setLngLat(releasePointCoords)
        .setPopup(new mapboxgl.Popup().setText(`Start: ${race.releasePoint.name}`))
        .addTo(currentMap);

      const bounds = new mapboxgl.LngLatBounds(releasePointCoords, releasePointCoords);

      lofts.forEach(loft => {
        if (loft.longitude && loft.latitude) {
          const loftCoords: [number, number] = [loft.longitude, loft.latitude];
          const marker = new mapboxgl.Marker({ color: '#1976d2', scale: 0.8 })
            .setLngLat(loftCoords)
            .setPopup(new mapboxgl.Popup().setText(`Gołębnik: ${loft.fancier.name}`))
            .addTo(currentMap);
          
          marker.getElement().style.cursor = 'pointer';
          marker.getElement().addEventListener('click', () => {
            setSelectedLoft(loft);
          });

          bounds.extend(loftCoords);
        }
      });

      currentMap.fitBounds(bounds, { padding: 100, duration: 1000 });
    });

    return () => currentMap.remove();
  }, [data]);

  if (isLoading) return <div style={{ padding: '2rem' }}>Ładowanie danych lotu...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Błąd: {error}</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Nie znaleziono danych lotu.</div>;

  const { race, lofts } = data;
  const releasePointCoords: [number, number] | null = 
    (race.releasePoint?.longitude && race.releasePoint?.latitude) 
    ? [race.releasePoint.longitude, race.releasePoint.latitude] 
    : null;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '300px', background: '#f8f9fa', padding: '1rem', overflowY: 'auto', borderRight: '1px solid #dee2e6', flexShrink: 0 }}>
        <Link href="/CreateRacePage">Powrót do listy lotów</Link>
        <h2 style={{ marginTop: '1rem', fontSize: '1.25rem' }}>{race.name}</h2>
        <p><strong>Start:</strong> {race.releasePoint?.name}</p>
        <p><strong>Data:</strong> {new Date(race.releaseDatetimeUtc!).toLocaleString('pl-PL')}</p>
        <hr style={{ margin: '1rem 0' }} />
        {selectedLoft && (
          <div style={{ marginBottom: '1rem', background: '#eef2ff', padding: '0.75rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 0 }}>Wybrany gołębnik:</h3>
            <p style={{ margin: '0.25rem 0' }}><strong>Hodowca:</strong> {selectedLoft.fancier.name}</p>
            {distance !== null && (
              <p style={{ margin: '0.25rem 0' }}><strong>Odległość:</strong> {distance.toFixed(3)} km</p>
            )}
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showWindLayer}
              onChange={() => setShowWindLayer(!showWindLayer)}
            />
            <span style={{ marginLeft: '0.5rem' }}>Pokaż warstwę wiatru</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showTempLayer}
              onChange={() => setShowTempLayer(!showTempLayer)}
            />
            <span style={{ marginLeft: '0.5rem' }}>Pokaż mapę cieplną temp.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showCloudLayer}
              onChange={() => setShowCloudLayer(!showCloudLayer)}
            />
            <span style={{ marginLeft: '0.5rem' }}>Pokaż zachmurzenie</span>
          </label>
        </div>
        <h3>Wybierz gołębnik:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {lofts.map(loft => (
            <li 
              key={loft.id} 
              onClick={() => setSelectedLoft(loft)}
              style={{ 
                padding: '0.5rem', 
                cursor: 'pointer', 
                borderRadius: '4px',
                background: selectedLoft?.id === loft.id ? '#dbeafe' : 'transparent',
                fontWeight: selectedLoft?.id === loft.id ? 'bold' : 'normal',
              }}
            >
              {loft.fancier.name}
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} />
        {map.current && releasePointCoords && selectedLoft && selectedLoft.longitude && selectedLoft.latitude && (
            <RaceRouteLayer
              key={`route-${selectedLoft.id}`}
              map={map.current}
              routeId={`loft-${selectedLoft.id}`}
              startCoordinates={releasePointCoords}
              endCoordinates={[selectedLoft.longitude, selectedLoft.latitude]}
            />
        )}
        {map.current && showWindLayer && <WindLayer map={map.current} />}
        {map.current && showTempLayer && <TemperatureLayer map={map.current} />}
        {map.current && showCloudLayer && <CloudLayer map={map.current} />}
      </main>
    </div>
  );
};

export default RaceVisualizePage;