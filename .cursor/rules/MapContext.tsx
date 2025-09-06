import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Map } from 'mapbox-gl';

interface MapContextType {
  map: Map | null;
  setMap: (map: Map | null) => void;
  selectedTime: Date;
  setSelectedTime: Dispatch<SetStateAction<Date>>;
  altitude: string;
  setAltitude: Dispatch<SetStateAction<string>>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<Map | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [altitude, setAltitude] = useState('500m'); // Default altitude from docs

  const value = useMemo(
    () => ({
      map,
      setMap,
      selectedTime,
      setSelectedTime,
      altitude,
      setAltitude,
    }),
    [map, selectedTime, altitude],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};